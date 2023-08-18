import boxesofwonders_tokenABI from "./boxesofwonders_token.js"
import tokenIDs from "./boxesofwonders_tokenIDs.js"

const btnConnect = document.getElementById('connect-button')
const lMessage = document.getElementById('message')
const spinner = document.getElementById('spinner')

const template = document.getElementById("nft_template")
const nfts = document.getElementById("nfts")

const POLYGON_MAINNET = 137n //'0x89'
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

const removeAllNfts = () => {
    const countNfts = nfts.childElementCount
    for(let i=0; i<countNfts; i++){
        nfts.removeChild(nfts.lastElementChild)
    }
}

const adaptIpfsUri = (uri) => {
    if(uri.startsWith("ipfs://")){
        uri = `https://ipfs.io/ipfs/${uri.split("ipfs://")[1]}`
    }
    return uri
}

const onClickConnect = async () => {
    btnConnect.onclick = null
    lMessage.textContent = ''
    removeAllNfts()
    spinner.style.visibility='visible'
    try {
        if(await isPolygonNetwork()){
            const accounts = await window.web3.eth.getAccounts()
            const account = accounts[0]

            const contract = new window.web3.eth.Contract(boxesofwonders_tokenABI, BOXES_OF_WONDERS_CONTRACT)
            contract.defaultCommon = {customChain: {name: 'Polygon Mainnet', chainId: POLYGON_MAINNET, networkId: POLYGON_MAINNET}};
            contract.defaultAccount = account

            var countBoxes = 0
            for(let i = 0; i < tokenIDs.length; i++){
                const boxTokenID = tokenIDs[i]
                const boxFound = await contract.methods.balanceOf(account, boxTokenID).call()
            
                if(boxFound>0){
                    countBoxes++
                    let boxMetadataURI = await contract.methods.uri(boxTokenID).call()
                    boxMetadataURI = adaptIpfsUri(boxMetadataURI)
                    const response = await fetch(boxMetadataURI)
                    const boxMetadata = await response.json()
                    
                    const boxElement = template.content.cloneNode(true)
                    boxElement.querySelector("p").innerText = boxMetadata['name']
                    boxElement.querySelector("a").href = `https://opensea.io/assets/matic/${BOXES_OF_WONDERS_CONTRACT}/${boxTokenID}`
                    boxElement.querySelector("img").src = adaptIpfsUri(boxMetadata['image_url'])
                    boxElement.querySelector("img").alt = boxMetadata['name']

                    nfts.append(boxElement)
                }
            }

            if(countBoxes<1){
                lMessage.textContent = 'You don\'t have any Box yet, let\'s go buy one!'
            }
        } else {
            lMessage.textContent = 'Switch to Polygon network'
        }
    } catch (error) {
        console.log(error)
        lMessage.textContent = 'Connection error'
    }
    spinner.style.visibility='hidden'
    btnConnect.onclick = onClickConnect
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