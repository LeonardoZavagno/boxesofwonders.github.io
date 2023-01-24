import boxesofwonders_tokenABI from "./boxesofwonders_token.js"

const btnConnect = document.getElementById('connect-button')
const lMessage = document.getElementById('message')

const POLYGON_MAINNET = 137 //'0x89'
const BOXES_OF_WONDERS_CONTRACT = '0x2953399124F0cBB46d2CbACD8A89cF0599974963'

const isMetaMaskInstalled = async () => {
    window.provider = await detectEthereumProvider()
    if(window.provider){
        try {
            const accounts = await window.provider.request({
                method: "eth_requestAccounts",
            });
            return Boolean(accounts[0])
        } catch (error) {
            console.log(error)
        }
    }
    return false
}

const isPolygonNetwork = async () => {
    const chainId = await window.web3.eth.getChainId()
    return Boolean(chainId && chainId === POLYGON_MAINNET)
}

const onClickConnect = async () => {
    try {
        if(await isPolygonNetwork()){
            const accounts = await window.web3.eth.getAccounts()
            const account = accounts[0]

            const contract = new window.web3.eth.Contract(boxesofwonders_tokenABI, BOXES_OF_WONDERS_CONTRACT)
            contract.defaultAccount = account
            console.log(account) //TO DELETE
            const numberOfBoxes = await contract.methods.balanceOf(account, 1).call()
            console.log(numberOfBoxes) //TO DELETE

            for(let i = 0; i < numberOfBoxes; i++){
                console.log(i) //TO DELETE
                const boxId = await contract.methods.tockenOfOwnerByIndex(account, i).call()
                console.log(boxId) //TO DELETE
                let boxMetadataURI = await contract.methods.tokenURI(boxId).call()
                console.log(boxMetadataURI) //TO DELETE

                if(boxMetadataURI.startsWith("ipfs://")){
                    boxMetadataURI = `https://ipfs.io/ipfs/${boxMetadataURI.split("ipfs://")[1]}`
                }
                console.log(boxMetadataURI) //TO DELETE

                const boxMetadata = await fetch(boxMetadataURI).then((response) => response.json())
                console.log(boxMetadata) //TO DELETE
                
                const boxName = boxMetadata['name']
                if(boxName.startsWith('Box of Wonder')){
                    const boxElement = document.getElementById("nft_template").content.cloneNode(true)
                    boxElement.querySelector("h1").innerText = boxName
                    boxElement.querySelector("a").href = `https://opensea.io/assets/matic/${BOXES_OF_WONDERS_CONTRACT}/${boxId}`
                    boxElement.querySelector("img").src = boxMetadata['image']
                    boxElement.querySelector("img").alt = boxMetadata['description']
                }
            }
        } else {
            lMessage.textContent = 'Switch to Polygon network'
        }
    } catch (error) {
        console.log(error)
        lMessage.textContent = 'Connection error'
    }
}
  
const initialize = async () => {
    if(await isMetaMaskInstalled()){
        window.web3 = new Web3(window.provider)
        lMessage.textContent = ''
        btnConnect.onclick = onClickConnect
    } else {
        lMessage.textContent = 'Metamask extension not installed'
        btnConnect.onclick = null
    }
}

window.addEventListener('DOMContentLoaded', initialize)