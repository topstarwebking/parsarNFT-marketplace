import { useState, useEffect } from "react";
import heroSliderData from "../assets/fake-data/data-slider";
import Slider from "../components/slider/Slider";
import Web3Modal from "web3modal";
import Authereum from "authereum";
import WalletConnectProvider from "@walletconnect/web3-provider";
import TodayPicks from "../components/layouts/TodayPicks";
import todayPickData from "../assets/fake-data/data-today-pick";
import Create from "../components/layouts/Create";
import Web3 from "web3";
import NFT from "../NFT.json";
import marketContractFile from "../NFTMarketPlace.json";
import ASIX_TOKEN from "../ASIX_TOKEN.json";
import axios from "axios";
import detectEthereumProvider from "@metamask/detect-provider";
import { formatUnits, parseUnits } from "ethers/lib/utils";

const Home = (props) => {
  const [provide, setProvider] = useState(props.provider);
  const [web3Api, setWe3Api] = useState({
    provider: null,
    web3: null,
  });

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
  const indexOfunsold = unsoldItems.length;

  useEffect(() => {
    LoadContracts();
  }, [web3Api.web3]);

  console.log(unsoldItems);

  const LoadContracts = async () => {
    //Paths of Json File
    const markrtAbi = marketContractFile.abi;
    const nFTAbi = NFT.abi;

    const netWorkId = await web3Api.web3.eth.net.getId();

    // const nftNetWorkObject = NFT.networks[netWorkId];w
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
      
      let array = [];
      data.map(async (item) => {
        const nftUrl = await deployedNftContract.methods
          .tokenURI(item.tokenId)
          .call();
        // const priceToWei = Web3.utils.fromWei(item.price.toString(), "ether");
        const priceToken = formatUnits(item.price.toString(), 9);
        // Web3.utils.fromWei(item.price.toString(), "ether");
        const metaData = await axios.get(nftUrl);
        console.log('nft: ', item);

        // //TODO: fix this object
        let myItem = {
          price: priceToken,
          itemId: item.id,
          owner: item.owner,
          seller: item.seller,
          image: metaData.data.image,
          name: metaData.data.name,
          description: metaData.data.description,
        };
        // array.push(myItem);
        setUnsoldItems((prevState) => [myItem, ...prevState]);
      });
      console.log(array);
    } else {
      window.alert(
        "You are at Wrong Netweok, Connect with Binance Smart Chain Please"
      );
    }
  };

  //Create nft Buy Function
  const buyNFT = async (nftItem) => {
    await window.ethereum.enable();
    let currentAddress = window.ethereum.selectedAddress;

    const ASIX_TOKENAbi = ASIX_TOKEN.abi;
    const ASIXAddress = ASIX_TOKEN.address;
    const ASIXAddressContract = await new web3Api.web3.eth.Contract(
      ASIX_TOKENAbi,
      ASIXAddress
    );
    console.log(ASIXAddressContract, marketContract);
    const price = parseUnits(nftItem.price, 9);
    // const priceToWei = Web3.utils.toWei(price.toString(), "ether");
    const Approval = await ASIXAddressContract.methods
      .approve(marketContract._address, price)
      .send({ from: currentAddress });

    const convertIdtoInt = Number(nftItem.itemId);

    const result = await marketContract.methods
      .createMarketForSaleWithToken(nftAddress, convertIdtoInt)
      .send({ from: currentAddress });
    window.location.reload();
    console.log(result);
  };

  return (
    <div className="home-1">
      <Slider data={heroSliderData} />
      {unsoldItems && (
        <TodayPicks
          nfts={
            unsoldItems.length > 8
              ? unsoldItems.slice(Math.max(unsoldItems.length - 8, 1))
              : unsoldItems
          }
          desc={false}
          buyNFT={buyNFT}
          title="Top Newest NFts Today"
        />
      )}
      <Create />
      {unsoldItems && (
        <TodayPicks
          nfts={unsoldItems}
          buyNFT={buyNFT}
          desc={true}
          title="Explore All Nfts Nad Buy"
        />
      )}
      {/* <TodayPicks data={todayPickData} /> */}
    </div>
  );
};

export default Home;
