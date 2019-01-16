// 설정한 property(capsule.properties)로부터 데이터를 가져옵니다.
const baseURL = config.get("baseUrl");
//다른 경로의 파일을 가져옵니다.
const nationData = require("./data/nationData.js");
const curCode = require("./data/currencyCode.js");

function makeURL(dateTime, base, target){
  var url = '';
  
  if(!dateTime){
    url = baseURL + 'latest?';
  }else{
    baseDate = dateTime.date.year + '-' + dateTime.date.month + '-' + dateTime.date.day;
    url = baseURL + baseDate + '?';
  }
  
  if(!target){
    url += 'base=' + base;
  }else{
    url += 'base=' + base + '&symbols=' + target.currencySymbol;
  }
  
  return url;
}

module.exports.function = function getCurrencyInfo (value, dateTime, baseCurrency, targetCurrency, $vivContext) {
  var url = '';
  var base = null;
  var target = null;
  // console.log($vivContext);
  if(!baseCurrency){
    
    var local = $vivContext.locale.split("-")[1];
    
    for(var i = 0; i < curCode.length; ++i){
      if(curCode[i].code == local){
        base = curCode[i].symbol;
        break;
      }
    }

    if(base == null){
      throw fail.checkedError("No Local", "NoLocal");
    }
    
    if(!targetCurrency){
      url = makeURL(dateTime, base, target);
    }else{
      url = makeURL(dateTime, base, targetCurrency);
    }
    
  }else{
    base = baseCurrency.currencySymbol;
    url = makeURL(dateTime, base, targetCurrency);
  }

  //외부 API로 부터 데이터를 받습니다. (https://bixbydevelopers.com/dev/docs/reference/JavaScriptAPI/http)
  // returnHeaders: API에 대한 Response를 Header 형식으로 받습니다.
  var response = http.getUrl(url, {format:"json", returnHeaders:true});
  
  if(response.status != 200){
    throw fail.checkedError("No Information", "NoInfo");
  }
     
  var result = [];
  var date = response.parsed.date;
  
  if(!value){
    value = 1;
  }
  
  for(var val in response.parsed.rates){
    if(base != val){
      result.push({
        baseSymbol: {
          currencySymbol: base
        },
        currencySymbol: val,
        nation: nationData[val],
        value: response.parsed.rates[val] * value,
        date: date,
        baseValue: value
      });
    }
  }
  
  console.log(result);
  return result;
}
