const provider = new ethers.providers.Web3Provider(
  window.ethereum,
  'any'
);

let signer;

let networkData;
let feeData;
let etherPrice;

let walletAddress;
let walletName;
let userBalanceWei;
let userTxCount;

const editHtml = async (id, text) => {
  document.getElementById(id).innerText = text;
}

const setNetworkData = async () => {
  networkData = await provider.getNetwork();
  editHtml('network-json', JSON.stringify(networkData, null, 2));
}

const setFeeData = async () => {
  feeData = await provider.getFeeData();
  feeDataFormatted = Object.keys(feeData).reduce((acc, key) => {
    acc[key] = ethers.utils.formatUnits(feeData[key], 'gwei') + ' gwei';
    return acc;
  }, {});
  editHtml('fee-json', JSON.stringify(feeDataFormatted, null, 2));
}


const aggregatorV3InterfaceABI = [{ 'inputs': [], 'name': 'decimals', 'outputs': [{ 'internalType': 'uint8', 'name': '', 'type': 'uint8' }], 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [], 'name': 'description', 'outputs': [{ 'internalType': 'string', 'name': '', 'type': 'string' }], 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [{ 'internalType': 'uint80', 'name': '_roundId', 'type': 'uint80' }], 'name': 'getRoundData', 'outputs': [{ 'internalType': 'uint80', 'name': 'roundId', 'type': 'uint80' }, { 'internalType': 'int256', 'name': 'answer', 'type': 'int256' }, { 'internalType': 'uint256', 'name': 'startedAt', 'type': 'uint256' }, { 'internalType': 'uint256', 'name': 'updatedAt', 'type': 'uint256' }, { 'internalType': 'uint80', 'name': 'answeredInRound', 'type': 'uint80' }], 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [], 'name': 'latestRoundData', 'outputs': [{ 'internalType': 'uint80', 'name': 'roundId', 'type': 'uint80' }, { 'internalType': 'int256', 'name': 'answer', 'type': 'int256' }, { 'internalType': 'uint256', 'name': 'startedAt', 'type': 'uint256' }, { 'internalType': 'uint256', 'name': 'updatedAt', 'type': 'uint256' }, { 'internalType': 'uint80', 'name': 'answeredInRound', 'type': 'uint80' }], 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [], 'name': 'version', 'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }], 'stateMutability': 'view', 'type': 'function' }]
const priceFeedAddresses = {
  rinkeby: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  homestead: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'
};

const setEtherPrice = async () => {
  const adr = priceFeedAddresses[networkData.name] || 'eth-usd.data.eth';
  const priceFeed = new ethers.Contract(adr, aggregatorV3InterfaceABI, provider);
  const decimals = await priceFeed.decimals();
  const result = await priceFeed.latestRoundData();
  etherPrice = result.answer / (10 ** decimals);
  editHtml('etherPrice', `Current ETH price is $${etherPrice}`);
};




const setWalletAddress = async () => {
  signer = provider.getSigner();
  walletAddress = await signer.getAddress();
  editHtml('walletId', `Wallet address: ${walletAddress}`);
}

const setWalletName = async () => {
  walletName = await provider.lookupAddress(walletAddress);
  editHtml('walletName', `Wallet name: ${walletName}`);
}

const setUserBalance = async () => {
  userBalanceWei = await provider.getBalance(walletAddress);
  const displayBalance = ethers.utils.formatEther(userBalanceWei);
  editHtml('walletBalance', `Wallet balance: ${displayBalance} ETH`);
}

const setTxSent = async () => {
  walletTxCount = await provider.getTransactionCount(walletAddress);
  editHtml('walletTxCount', `Wallet has done ${userTxCount} transactions`);
}

const testSign = async () => {
  try {
    await signer.signMessage('Some custom message');
  } catch (e) {
    switch (e.code) {
      case 4001:
        console.log(e.message);
        break;
      default:
        console.error(e);
        break;
    }
  }
}

const main = async () => {
  await provider.send('eth_requestAccounts', []);
  await Promise.all([
    await setFeeData(),
    await setNetworkData(),
    await setWalletAddress(),
    await setWalletName(),
    await setUserBalance(),
    await setTxSent()
  ])
  await Promise.all([
    await setEtherPrice(),
  ]);
  // await testSign();
};

main();
