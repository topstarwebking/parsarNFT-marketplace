import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Web3Modal from "web3modal";
import Authereum from "authereum";
import WalletConnectProvider from "@walletconnect/web3-provider";
import menus from "../../menu";
import DarkMode from "./DarkMode";
import logoheader from "../../assets/images/logo/LOGO.svg";
import logoheader2x from "../../assets/images/logo/LOGO.svg";
import logodark from "../../assets/images/logo/LOGO.svg";
import logodark2x from "../../assets/images/logo/LOGO.svg";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

const Header = (props) => {
  const { pathname } = useLocation();
  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [provide, setProvide] = useState(null);
  const headerRef = useRef(null);

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "3fd4907115b84c7eb48e95514768a4e8",
      },
    },
    authereum: {
      package: Authereum, // required
    },
  };

  const web3Modal = new Web3Modal({
    cacheProvider: true, // optional
    providerOptions, // required
    theme: {
      background: "rgb(39, 49, 56)",
      main: "rgb(199, 199, 199)",
      secondary: "rgb(136, 136, 136)",
      border: "rgba(195, 195, 195, 0.14)",
      hover: "rgb(16, 26, 32)",
    },
  });

  useEffect(() => {
    // connectMetamask();
    // window.addEventListener('scroll', isSticky);
    // return () => {
    //     window.removeEventListener('scroll', isSticky);
    // };
  }, []);

  const connectMetamask = async () => {
    const provider = await web3Modal.connect();
    props.setProvider(provider);
    setProvide(provider);
    localStorage.setItem("provider", provider);
    const web3 = new Web3(provider);

    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    const balance = await web3.eth.getBalance(accounts[0]);
    let amount = web3.utils.fromWei(web3.utils.toBN(balance), "ether");
    setAccountBalance(amount);
  };

  const disconnectMetamask = async () => {
    await web3Modal.clearCachedProvider();
    localStorage.clear("");
    window.location.reload();
  };

  const isSticky = (e) => {
    const header = document.querySelector(".js-header");
    const scrollTop = window.scrollY;
    scrollTop >= 300
      ? header.classList.add("is-fixed")
      : header.classList.remove("is-fixed");
    scrollTop >= 400
      ? header.classList.add("is-small")
      : header.classList.remove("is-small");
  };

  const menuLeft = useRef(null);
  const btnToggle = useRef(null);

  const menuToggle = () => {
    console.log(1);
    menuLeft.current.classList.toggle("active");
    btnToggle.current.classList.toggle("active");
  };

  const [activeIndex, setActiveIndex] = useState(null);
  const handleOnClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <header id="header_main" className="header_1 js-header" ref={headerRef}>
      <div className="themesflat-container">
        <div className="row">
          <div className="col-md-12">
            <div id="site-header-inner">
              <div className="wrap-box flex">
                <div id="site-logo" className="clearfix">
                  <div id="site-logo-inner">
                    <Link to="/" rel="home" className="main-logo">
                      <img
                        className="logo-dark"
                        id="logo_header"
                        src={logodark}
                        width={300}
                        srcSet={`${logodark2x}`}
                        alt="nft-gaming"
                      />
                      <img
                        className="logo-light"
                        id="logo_header"
                        src={logoheader}
                        width={300}
                        srcSet={`${logoheader2x}`}
                        alt="nft-gaming"
                      />
                    </Link>
                  </div>
                </div>
                <div
                  className="mobile-button"
                  ref={btnToggle}
                  onClick={menuToggle}
                >
                  <span></span>
                </div>
                <nav id="main-nav" className="main-nav" ref={menuLeft}>
                  <ul id="menu-primary-menu" className="menu">
                    {menus.map((data, index) => (
                      <li
                        key={index}
                        onClick={() => handleOnClick(index)}
                        className={`menu-item ${
                          data.namesub ? "menu-item-has-children" : ""
                        } ${activeIndex === index ? "active" : ""} `}
                      >
                        <Link to={data.links}>{data.name}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="flat-search-btn flex">
                  <div className="sc-btn-top mg-r-12" id="site-header">
                    <a
                      onClick={
                        accountBalance !== null
                          ? () => disconnectMetamask()
                          : () => connectMetamask()
                      }
                      href="#"
                      className="sc-button header-slider style style-1 wallet fl-button pri-1"
                    >
                      <span>
                        {account === null
                          ? "Connect Wallet"
                          : String(account).substring(0, 6) +
                            "..." +
                            String(account).substring(38)}
                      </span>
                    </a>
                    {accountBalance !== null && (
                      <a
                        onClick={() => disconnectMetamask()}
                        className="sc-button header-slider style style-1 fl-button pri-1 balance"
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            padding: "0px",
                            color: "white",
                          }}
                        >
                          Balance : {parseFloat(accountBalance).toFixed(4)}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DarkMode />
    </header>
  );
};

export default Header;
