
const cheerio = require('cheerio')
const axios = require('axios')

async function test()
{
    const response = await axios.get('https://goldtraders.or.th')
    const html = response.data;
    const $ = cheerio.load(html);
    const selector = $("#DetailPlace_uc_goldprices1_GoldPricesUpdatePanel font[color]")
    if (selector.length !== 4) {
      return null
    }
    let priceCurrent = ""
    selector.each((index, element) => {
      if (index === 0) {
        priceCurrent = $(element).text()
      } else {
        priceCurrent = priceCurrent.concat("|", $(element).text())
        console.log(priceCurrent);
      }
    })
}

test();