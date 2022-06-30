import { useState, useEffect } from "react";
import TodayPicks from "../components/layouts/TodayPicks";
import Create from "../components/layouts/Create";
import { Link, useLocation } from "react-router-dom";
import NFT from "../NFT.json";
import marketContractFile from "../NFTMarketPlace.json";
import Web3 from "web3";
import { Tabs } from "react-tabs";
import axios from "axios";
import detectEthereumProvider from "@metamask/detect-provider";

const Purchased = (props) => {
  const [provide, setProvider] = useState(props.provider);
  const [web3Api, setWe3Api] = useState({
    provider: null,
    web3: null,
  });
  useEffect(() => {
    setProvider(props.provider);
  });

  //Craete function to listen the change in account changed and network changes

  const providerChanged = (provider) => {
    provider.on("accountsChanged", (_) => window.location.reload());
    provider.on("chainChanged", (_) => window.location.reload());
  };

  useEffect(() => {
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

    loadProvider();
  }, [provide]);
  //Create LoadAccounts Function
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    web3Api.web3 && loadAccount();
  }, [web3Api.web3]);

  //Load Contracts Function
  const [nftContract, setNFtContract] = useState(null);
  const [marketContract, setMarketContract] = useState(null);
  const [nftAddress, setNFtAddress] = useState(null);
  const [marketAddress, setMarketAddress] = useState(null);
  const [purchasedItems, setpurchasedItems] = useState([]);

  useEffect(() => {
    const LoadContracts = async () => {
      const markrtAbi = marketContractFile.abi;
      const nFTAbi = NFT.abi;

      const netWorkId = await web3Api.web3.eth.net.getId();

      //  const nftNetWorkObject =  NFT.networks[netWorkId];
      //  const nftMarketWorkObject =  marketContractFile.networks[netWorkId];

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

        console.log(account);
        //Fetch all unsold items
        const data = await deployedMarketContract.methods
          .getMyNFTPurchased()
          .call({ from: account });
        console.log(data);
        const items = await Promise.all(
          data.map(async (item) => {
            const nftUrl = await deployedNftContract.methods
              .tokenURI(item.tokenId)
              .call();
            console.log(nftUrl);
            console.log(item);
            const priceToWei = Web3.utils.fromWei(
              item.price.toString(),
              "ether"
            );
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
            console.log(item);

            return myItem;
          })
        );

        setpurchasedItems(items);
      } else {
        window.alert("You are at Wrong Netweok, Connect with Roposten Please");
      }
    };
    web3Api.web3 && LoadContracts();
  }, [account]);

  return (
    <div className="authors-2">
      <section className="flat-title-page inner">
        <div className="overlay"></div>
        <div className="themesflat-container">
          <div className="row">
            <div className="col-md-12">
              <div className="page-title-heading mg-bt-12">
                <h1 className="heading text-center">Purchased</h1>
              </div>
              <div className="breadcrumbs style2">
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <span
                    style={{
                      fontSize: "18px",
                      marginLeft: "5px",
                    }}
                  >
                    <a>Purchased</a>
                  </span>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="tf-section authors"
        style={{
          padding: "0px",
        }}
      >
        <div className="themesflat-container">
          <div className="content-inner">
            <div className="row">
              {!purchasedItems.length ? (
                <section className="tf-section today-pick">
                  <div className="themesflat-container">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="heading-live-auctions mg-bt-21">
                          <h2 className="tf-title pad-l-7">My NFTs</h2>
                          <Link to="/" className="exp style2">
                            EXPLORE
                          </Link>
                        </div>
                        <h5 class="sub-title ct style-1 pad-400">
                          No NFT have been Purchased By <br></br>this Wallet
                          Address Yet
                        </h5>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <TodayPicks nfts={purchasedItems} title="My NFTs" desc={true} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Purchased;
