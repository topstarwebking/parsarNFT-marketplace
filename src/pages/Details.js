import { useState, useEffect } from "react";
import Web3 from "web3";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import NFT from "../NFT.json";
import marketContractFile from "../NFTMarketPlace.json";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";

const Details = (props) => {
  const [provide, setProvider] = useState(props.provider);
  const [history, setHistory] = useState([]);
  const [web3Api, setWe3Api] = useState({
    provider: null,
    web3: null,
  });
  const tokenId = useParams().tokenId;
  useEffect(() => {
    setProvider(props.provider);
  });

  const loadProvider = async () => {
    const provider = props.provider;
    if (provider) {
      providerChanged(provider);
      setWe3Api({
        provider,
        web3: new Web3(provider),
      });
    }
  };

  useEffect(() => {
    loadProvider();
  }, [provide]);

  const providerChanged = (provider) => {
    provider.on("accountsChanged", (_) => window.location.reload());
    provider.on("chainChanged", (_) => window.location.reload());
  };

  // Today Pick
  const [nftAddress, setNFtAddress] = useState(null);
  const [marketAddress, setMarketAddress] = useState(null);
  const [nftContract, setNFtContract] = useState(null);
  const [marketContract, setMarketContract] = useState(null);
  const [unsoldItems, setUnsoldItems] = useState([]);
  //   const indexOfunsold = unsoldItems.length;

  useEffect(async () => {
    await LoadContracts();
    await History();
  }, [web3Api.web3]);

  const LoadContracts = async () => {
    //Paths of Json File
    const markrtAbi = marketContractFile.abi;
    const nFTAbi = NFT.abi;

    const netWorkId = await web3Api.web3.eth.net.getId();

    // const nftNetWorkObject = NFT.networks[netWorkId];
    // const nftMarketWorkObject = marketContractFile.networks[netWorkId];
    if (netWorkId === 97) {
      const nftAddress = NFT.address;
      setNFtAddress(nftAddress);
      const marketAddress = marketContractFile.address;
      setMarketAddress(marketAddress);

      const deployedNftContract = await new web3Api.web3.eth.Contract(
        nFTAbi,
        nftAddress
      );
      setNFtContract(deployedNftContract);
      const deployedMarketContract = await new web3Api.web3.eth.Contract(
        markrtAbi,
        marketAddress
      );
      setMarketContract(deployedMarketContract);

      //Fetch all unsold items
      const data = await deployedMarketContract.methods
        .getAllUnsoldItems()
        .call();
      // const items = await Promise.all(
      data.map(async (item) => {
        const nftUrl = await deployedNftContract.methods
          .tokenURI(item.tokenId)
          .call();
        const priceToWei = Web3.utils.fromWei(item.price.toString(), "ether");
        const metaData = await axios.get(nftUrl);
        //TODO: fix this object
        let myItem = {
          price: priceToWei,
          itemId: item.id,
          owner: item.owner,
          seller: item.seller,
          image: metaData.data.image,
          name: metaData.data.name,
          description: metaData.data.description,
        };

        if (item.id === tokenId) {
          console.log(1);
          setUnsoldItems(myItem);
        }
      });
    } else {
      window.alert("You are at Wrong Netweok, Connect with Roposten Please");
    }
  };

  //Create nft Buy Function
  const buyNFT = async (nftItem) => {
    await window.ethereum.enable();
    let currentAddress = window.ethereum.selectedAddress;
    const priceToWei = Web3.utils.toWei(nftItem.price.toString(), "ether");
    const convertIdtoInt = Number(nftItem.itemId);

    const result = await marketContract.methods
      .createMarketForSale(nftAddress, convertIdtoInt)
      .send({ from: currentAddress, value: priceToWei });
    window.location.reload();
  };

  const History = async () => {
    const markrtAbi = marketContractFile.abi;
    const nFTAbi = NFT.abi;
    const netWorkId = await web3Api.web3.eth.net.getId();
    // const nftNetWorkObject = NFT.networks[netWorkId];
    // const nftMarketWorkObject = marketContractFile.networks[netWorkId];
    if (netWorkId === 97) {
      const nftAddress = NFT.address;

      axios.defaults.headers.common = {
        "X-API-Key":
          "vBbLWHRePzZYdZnznRwHCrFXCSbznafOMD5uPd7DdYcMuwdpXK7njFHFII2hN5Fa",
      };
      axios({
        method: "get",
        url: `https://deep-index.moralis.io/api/v2/nft/${nftAddress}/${tokenId}/transfers?chain=bsc testnet&format=decimal`,
      }).then((response) => {
        console.log(response);
        setHistory(response.data.result);
      });
    }
    //   https://deep-index.moralis.io/api/v2/nft/0x3c0138270bCc44541417c534086bCF0b23Ce12a3/128/transfers?chain=ropsten&format=decimal
  };

  return (
    <div>
      <section className="flat-title-page inner">
        <div className="overlay"></div>
        <div className="themesflat-container">
          <div className="row">
            <div className="col-md-12">
              <div className="page-title-heading mg-bt-12">
                <h1 className="heading text-center">Sold Items</h1>
              </div>
              <div className="breadcrumbs style2">
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>Sold Items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="tf-section tf-item-details">
        <div className="themesflat-container">
          {unsoldItems.length !== 0 && (
            <div className="row">
              <div className="col-xl-6 col-md-12">
                <div className="content-left">
                  <div className="media">
                    <img
                      src={unsoldItems.image}
                      alt="Axies"
                      style={{
                        width: "100%",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-md-12">
                <div className="content-right">
                  <div className="sc-item-details">
                    <h2 className="style2">{unsoldItems.name}</h2>
                    <div className="client-infor sc-card-product">
                      <div className="meta-info">
                        <div className="author">
                          <div className="info">
                            <span>Owned By</span>
                            <h6>
                              {" "}
                              <a>
                                {String(unsoldItems.seller).substring(0, 6) +
                                  "..." +
                                  String(unsoldItems.seller).substring(38)}
                              </a>{" "}
                            </h6>
                          </div>
                        </div>
                      </div>
                      <div className="meta-info">
                        <div className="author">
                          <div className="info">
                            <span>Create By</span>
                            <h6>
                              {" "}
                              <a>
                                {String(unsoldItems.owner).substring(0, 6) +
                                  "..." +
                                  String(unsoldItems.owner).substring(38)}
                              </a>{" "}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p>{unsoldItems.description}</p>
                    <div className="meta-item-details style2">
                      <div className="item meta-price">
                        <span className="heading">Price</span>
                        <div className="price">
                          <div className="price-box">
                            <h5> {unsoldItems.price} ETH</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className="sc-button loadmore style bag fl-button pri-3"
                      style={{
                        width: "100%",
                      }}
                      onClick={() => buyNFT(unsoldItems)}
                    >
                      <span>Buy NFT</span>
                    </button>
                    <div className="flat-tabs themesflat-tabs">
                      <Tabs>
                        <TabList>
                          <Tab>Item Activity</Tab>
                          <Tab>Details</Tab>
                        </TabList>

                        <TabPanel>
                          <table>
                            <tr>
                              <th>Event</th>
                              <th>Price</th>
                              <th
                                style={{
                                  width: "120px",
                                }}
                              >
                                From
                              </th>
                              <th
                                style={{
                                  width: "120px",
                                }}
                              >
                                To
                              </th>
                              <th>Quantity</th>
                              <th
                                style={{
                                  width: "100px",
                                }}
                              >
                                Date
                              </th>
                            </tr>
                            {history.length !== 0 && (
                              <>
                                {history.map((item, index) => (
                                  <tr>
                                    <td>
                                      {item.value == 0 ? (
                                        <>Minted</>
                                      ) : (
                                        <>Sale</>
                                      )}
                                    </td>
                                    <td>
                                      {Web3.utils.fromWei(
                                        item.value.toString(),
                                        "ether"
                                      )}{" "}
                                      ETH
                                    </td>
                                    <td>
                                      {String(item.from_address).substring(
                                        0,
                                        6
                                      ) +
                                        "..." +
                                        String(item.from_address).substring(
                                          38
                                        )}{" "}
                                    </td>
                                    <td>
                                      {String(item.to_address).substring(0, 6) +
                                        "..." +
                                        String(item.to_address).substring(
                                          38
                                        )}{" "}
                                    </td>
                                    <td>{item.amount}</td>
                                    <td>
                                      {new Date(
                                        item.block_timestamp
                                      ).toDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </>
                            )}
                          </table>
                        </TabPanel>
                        <TabPanel>
                          <table>
                            <tr>
                              <td>Contract Address</td>
                              <td>
                                {String(nftAddress).substring(0, 6) +
                                  "..." +
                                  String(nftAddress).substring(38)}{" "}
                              </td>
                            </tr>
                            <tr>
                              <td>Token ID</td>
                              <td>{tokenId}</td>
                            </tr>
                            <tr>
                              <td>Token Standard</td>
                              <td>ERC721</td>
                            </tr>
                            <tr>
                              <td>Blockchain</td>
                              <td>Ethereum</td>
                            </tr>
                          </table>
                        </TabPanel>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    // <div className="home-1">
    //   <Slider data={heroSliderData} />
    //   {unsoldItems && (
    //     <TodayPicks
    //       nfts={unsoldItems.slice(Math.max(unsoldItems.length - 8, 1))}
    //       desc={false}
    //       buyNFT={buyNFT}
    //       title="Top Newest NFts Today"
    //     />
    //   )}
    //   <Create />
    //   {unsoldItems && (
    //     <TodayPicks
    //       nfts={unsoldItems}
    //       buyNFT={buyNFT}
    //       desc={true}
    //       title="Explore All Nfts Nad Buy"
    //     />
    //   )}
    //   {/* <TodayPicks data={todayPickData} /> */}
    // </div>
  );
};

export default Details;
