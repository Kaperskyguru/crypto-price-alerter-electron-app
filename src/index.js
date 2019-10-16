const electron = require('electron');
const path = require('path');
const axios = require('axios');
const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.ipcRenderer;

const prices = document.querySelectorAll('h1');
const notifyButtons = document.querySelectorAll('button');
let el_ment;
const el_ments = [];

const notification = {
    title: "BTC Alert",
    body: "BTC just beat your target price",
    icon: path.join(__dirname, '../assets/images/btc.png')
}


function getBTC() {
    axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,LTC,BCH,EOS,XRP,ETC,WTC,LINK,BNB&tsyms=USD,EUR`)
        .then(res => {
            const cryptos = res.data;



            for (price of prices) {
                const price_element = document.getElementById(price.id);
                const ids = price_element.id;
                const currency = ids.split('_')[1].toUpperCase();

                const element = document.getElementById('indicator_'+ currency);

                if (cryptos[currency].USD > price_element.innerHTML) {
                    element.classList.remove('fa-caret-up')
                    element.classList.add('fa-caret-down')
                    element.style.color = '#FF0057'

                } else {
                    element.classList.remove('fa-caret-down')
                    element.classList.add('fa-caret-up')
                    element.style.color = 'green'

                }
                price_element.innerHTML = cryptos[currency].USD;


            }

            el_ments.forEach((item) => {
                const targetPrice = document.getElementById('targetPrice_' + item);
                const price = targetPrice.innerHTML.split('$')[1]

                notification.title = item + " Alert";
                notification.body = item + " just beat your target price"

                if (targetPrice.innerHTML != "" && targetPrice.innerHTML != '$0' && price < cryptos[item].USD) {
                    const myNotification = new window.Notification(notification.title, notification);
                }
            })
        })
}

getBTC();
setInterval(getBTC, 10000)

const buttons = [...notifyButtons]

buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
        el_ment = event.srcElement.id.split('_')[1].toUpperCase();

        if (!el_ments.includes(el_ment)) {
            el_ments.push(el_ment);
        }

        const modalPath = path.join('file://', __dirname, 'add.html')
        let win = new BrowserWindow({
            width: 400,
            height: 200,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
            }
        });
        win.setTitle('BTC');
        win.on('close', function () {
            let win = null;
        });
        win.loadURL(modalPath);
        win.show();

    });
})


ipc.on('targetPriceVal', function (event, arg) {
    let targetPriceVal = Number(arg);
    const el = document.getElementById('targetPrice_' + el_ment);
    el.innerHTML = '$' + targetPriceVal.toLocaleString('en')
})