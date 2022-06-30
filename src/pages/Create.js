import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import { Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { create } from "ipfs-http-client";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import NFT from "../NFT.json";
import ASIX_TOKEN from "../ASIX_TOKEN.json";
import marketContractFile from "../NFTMarketPlace.json";
import { parseUnits } from '@ethersproject/units';

const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");
const CreateItem = (props) => {
  const [web3Api, setWe3Api] = useState({
    provider: null,
    web3: null,
  });
  const [provide, setProvider] = useState(props.provider);
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

      providerChanged(provider);
      setWe3Api({
        provider,
        web3: new Web3(provider),
      });
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
  const [loading, setLoading] = useState();
  const [unsoldItems, setUnsoldItems] = useState([]);

  const [urlHash, setUrlHash] = useState();
  const onChange = async (e) => {
    const file = e.target.files[0];

    console.log("before");

    try {
      console.log("after try");
      const addedFile = await ipfsClient.add(file);

      const ipfsUrl = `https://ipfs.infura.io/ipfs/${addedFile.path}`;
      setUrlHash(ipfsUrl);
    } catch (e) {
      console.log(e);
    }
  };

  const [nftFormInput, setNftFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

  const createMarketItem = async () => {
    const { price, name, description } = nftFormInput;
    if (!price || !name || !description || !urlHash) return;

    const data = JSON.stringify({
      name,
      description,
      image: urlHash,
    });

    try {
      const addedFile = await ipfsClient.add(data);

      const ipfsUrl = `https://ipfs.infura.io/ipfs/${addedFile.path}`;
      createMarketForSale(ipfsUrl);
    } catch (e) {
      console.log(e);
    }
  };

  const createMarketForSale = async (url) => {
    //Paths of Json File
    const markrtAbi = marketContractFile.abi;
    const nFTAbi = NFT.abi;
    const ASIX_TOKENAbi = ASIX_TOKEN.abi;

    const netWorkId = await web3Api.web3.eth.net.getId();

    // const nftNetWorkObject = NFT.networks[netWorkId];
    // const nftMarketWorkObject = marketContractFile.networks[netWorkId];

    if (netWorkId === 97) {
      // setLoading(true);
      const nftAddress = NFT.address;
      const marketAddress = marketContractFile.address;
      const ASIXAddress = ASIX_TOKEN.address;

      const deployedNftContract = await new web3Api.web3.eth.Contract(
        nFTAbi,
        nftAddress
      );
      // console.log(deployedNftContract);

      setNFtContract(deployedNftContract);
      const deployedMarketContract = await new web3Api.web3.eth.Contract(
        markrtAbi,
        marketAddress
      );
      setMarketContract(deployedMarketContract);
      // console.log(deployedMarketContract);

      const ASIXAddressContract = await new web3Api.web3.eth.Contract(
        ASIX_TOKENAbi,
        ASIXAddress
      );
      // console.log(ASIXAddressContract);

      if (account) {
        //Start to create NFt Item Token To MarketPlace
        let createTokenResult = await deployedNftContract.methods
          .createNFTToken(url)
          .send({ from: account });

        const tokenid = createTokenResult.events.Transfer.returnValues["2"];

        console.log(tokenid);

        let marketFees = await deployedMarketContract.methods
          .gettheMarketFeesForToken()
          .call();
        console.log(marketFees);
        // marketFees = marketFees.toString();

        // const marketFees = 10000 * 10 ** 9;

        console.log(deployedNftContract);
        console.log(deployedMarketContract);

        const Approval = await ASIXAddressContract.methods
          .approve(deployedMarketContract._address, marketFees)
          .send({ from: account });

        // const priceToWei = nftFormInput.price * 10 ** 9;
        const priceToWei = parseUnits(`${nftFormInput.price}`, 9).toString();
        // Web3.utils.toWei(nftFormInput.price, "ether");
        // console.log(deployedMarketContract);
        const lanchTheNFtForSale = await deployedMarketContract.methods
          .createItemForSaleWithToken(
            deployedNftContract._address,
            tokenid,
            priceToWei
          )
          .send({ from: account, value: marketFees });
        window.location.reload();
      }
    } else {
      window.alert("You are at Wrong Netweok, Connect with Roposten Please");
    }
  };
  return (
    <div className="create-item">
      <section className="flat-title-page inner">
        <div className="overlay"></div>
        <div className="themesflat-container">
          <div className="row">
            <div className="col-md-12">
              <div className="page-title-heading mg-bt-12">
                <h1 className="heading text-center">Create Item</h1>
              </div>
              <div className="breadcrumbs style2">
                <ul>
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>Create Item</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="tf-create-item tf-section">
        <div className="themesflat-container">
          <div className="row">
            <div className="col-xl-12 col-lg-6 col-md-12 col-12">
              <div className="form-create-item">
                <form action="#">
                  <h4 className="title-create-item">Upload file</h4>
                  <label className="uploadFile">
                    {urlHash ? (
                      <img width={400} src={urlHash} />
                    ) : (
                      <span className="filename">
                        PNG, JPG, GIF, WEBP or MP4. Max 200mb.
                      </span>
                    )}
                    <br></br>

                    <input
                      type="file"
                      className="inputfile form-control"
                      onChange={onChange}
                      name="file"
                    />
                  </label>
                </form>
                <div className="flat-tabs tab-create-item">
                  <Tabs>
                    <h4 className="title-create-item">Price</h4>
                    <input
                      type="text"
                      placeholder="Enter price for one item (ASIX)"
                      onChange={(e) =>
                        setNftFormInput({
                          ...nftFormInput,
                          price: e.target.value,
                        })
                      }
                    />
                    <br></br>
                    <br></br>
                    <h4 className="title-create-item">Title</h4>
                    <input
                      type="text"
                      placeholder="Item Name"
                      onChange={(e) =>
                        setNftFormInput({
                          ...nftFormInput,
                          name: e.target.value,
                        })
                      }
                    />
                    <br></br>
                    <br></br>
                    <h4 className="title-create-item">Description</h4>
                    <textarea
                      placeholder="e.g. “This is very limited item”"
                      onChange={(e) =>
                        setNftFormInput({
                          ...nftFormInput,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                    <br></br>
                    <br></br>
                    <br></br>
                    {loading ? (
                      <p>Loading</p>
                    ) : (
                      <button
                        class="sc-button fl-button pri-3"
                        onClick={createMarketItem}
                      >
                        <span
                          style={{
                            color: "#fff",
                          }}
                        >
                          Mint NFT
                        </span>
                      </button>
                    )}
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateItem;
