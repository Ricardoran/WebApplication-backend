const express = require('express');
const https = require("https");
const url = require("url");
const request = require("request");
const axios = require('axios');
const app = express();
var keyword = '';
const port = process.env.PORT || 3000;

const api_key = "HaoranZh-RicardoZ-PRD-42eb84a53-e0284ef5";


app.get('/', function (req,res) {

  console.log('server is running');
  // set http headers
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // define payload
  var url_api = "";
  const url_api_endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';

  url_api += url_api_endpoint;

  // add default params
  url_api += "?OPERATION-NAME=findItemsAdvanced";

  url_api += "&SERVICE-VERSION=1.0.0";

  url_api += "&SECURITY-APPNAME=";

  url_api += api_key;

  url_api += '&RESPONSE-DATA-FORMAT=JSON';


  console.log(url_api);

  var data = url.parse(req.url, true).query;
  console.log(data);

  var index = 0;


  /*************get keywords**************/
  keyword = data.input_keyword;
  url_api += '&keywords=';
  url_api += keyword;
  console.log('keyword is ' + keyword);


  /*************get sort order**************/
  var sort_order = data.input_sort_order;

  // if we click 'clear', it will make a 'null' to the next search
  if (sort_order == 'null'){
    url_api += '&sortOrder=BestMatch';
  }else{
    url_api += '&sortOrder=';
    url_api += sort_order;
  }
  console.log('sort_order is ' + sort_order);


  /*************get input price range (min and max)**************/
  var  min_price= data.input_min;
  console.log('min value is ' + min_price);
  var  max_price= data.input_max;
  console.log('max value is ' + max_price);


  // if these two ranges are not none, feed different params into them
  if (min_price && min_price !== 'null'){
    url_api += "&itemFilter(" + index + ").name=MinPrice";
    url_api += "&itemFilter(" + index + ").value=" + min_price;
    url_api += "&itemFilter(" + index + ").paramName=Currency";
    url_api += "&itemFilter(" + index + ").paramValue=USD";
    index++;

  }

  if (max_price && max_price !== 'null'){
    url_api += "&itemFilter(" + index + ").name=MaxPrice";
    url_api += "&itemFilter(" + index + ").value=" + max_price;
    url_api += "&itemFilter(" + index + ").paramName=Currency";
    url_api += "&itemFilter(" + index + ").paramValue=USD";
    index++;
  }



  /*************get different conditions**************/
  var conditionList = data.condition;
  console.log('condition list is: ');
  console.log(conditionList);

  if (conditionList){
    url_api += '&itemFilter('+index+ ').name=Condition';

    // conditionList is an object
    if (typeof (conditionList) == 'object'){
      for (var i = 0; i < conditionList.length; i++){
        url_api += '&itemFilter(' + index + ').value(' + i + ')=' + conditionList[i];
      }
    }
    else {
      // conditionList is a string
      url_api += '&itemFilter(' + index + ').value(0)=' + conditionList;
    }
    index ++;
  }



  /*************get seller info (return or not return)**************/
  var seller = data.seller;
  console.log('seller is ' + seller);

  if (seller){
    url_api += '&itemFilter(' + index + ').name=ReturnsAcceptedOnly';
    url_api += '&itemFilter(' + index + ').value=true';
    index += 1;
  }
  else{
    url_api += '&itemFilter(' + index + ').name=ReturnsAcceptedOnly';
    url_api += '&itemFilter(' + index + ').value=false';
    index += 1;
  }


  /*************get shipping choices**************/
  var free_shipping = data.input_free_shipping;
  var expedited_shipping = data.input_free_shipping;
  console.log('free_shipping is ' + free_shipping);
  console.log('expedited_shipping is ' + expedited_shipping);

  var checkIfFree = false;
  
  if (free_shipping){
    if (typeof (free_shipping) == 'object'){
      for (var j = 0; j < free_shipping.length; j++){
        if (free_shipping[i] == 'expedited'){
          url_api += '&itemFilter' + index + ").name=ExpeditedShippingType";
          url_api += "&itemFilter(" + index + ").value=Expedited";
        }
        if (free_shipping[i] == 'free'){
          url_api +=  '&itemFilter' + index + ").name=ExpeditedShippingType";
          url_api +=  '&itemFilter' + index + ").value=true";
          index ++;
          checkIfFree = true;
        }
      }
    }
    else {
      // free_shipping only has one element
      if (free_shipping == 'expedited'){
        url_api += '&itemFilter(' + index + ').name=ExpeditedShippingType';
        url_api += '&itemFilter(' + index + ').value=Expedited';
        index ++;
      }
      if (free_shipping == 'free'){
        url_api += '&itemFilter(' + index + ').name=FreeShippingOnly';
        url_api += '&itemFilter(' + index + ').value=true';
        index +=1;
        checkIfFree = true;
      }
    }
  }
  if (checkIfFree === false){
    url_api += "&itemFilter(" + index + ").name=FreeShippingOnly";
    url_api += "&itemFilter(" + index + ").value=false";
    index++;
  }
  console.log('url is ');
  console.log(url_api);

  axios.get(url_api).then(function (response) {
    console.log('---------------------');
    console.log(response.data);
    res.json(processData(response.data));
  });

});


// we use this function to process received data from ebay database
// and forward it to front-end
function processData(data){

  var itemCount;
  var numTotalEntries;
  var searchedItems;
  var length;

  // if ack == 'fail'
  if (data['findItemsAdvancedResponse'][0]['ack'] === 'Failure'){
    return {'itemCount': 0};
  }
  else {
    // ack == 'success'
    numTotalEntries = data['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'];
    searchedItems = data['findItemsAdvancedResponse'][0]['searchResult'][0]['item']
  }

  // no searched items or total entries == 0
  if (!searchedItems || numTotalEntries === 0){
    return {'itemCount': 0};
  }else {
    // in this case, total entries > 0 and searchedItem exists
    length = searchedItems.length;
    for (var i = 0; i < searchedItems.length; i++){
      
      // follow the instruction to include all 'attribute loss' cases 
      if (!searchedItems[i]['title'] ||
          !searchedItems[i]['galleryURL'] ||
          !searchedItems[i]['condition'] ||
          !searchedItems[i]['location'] ||
          !searchedItems[i]['primaryCategory'][0]['categoryName'] ||
          !searchedItems[i]['condition'][0]['conditionDisplayName'] ||
          !searchedItems[i]['shippingInfo'][0]['shippingType'] ||
          !searchedItems[i]['shippingInfo'][0]['shippingServiceCost'] ||
          !searchedItems[i]['shippingInfo'][0]['shipToLocations'] ||
          !searchedItems[i]['shippingInfo'][0]['expeditedShipping'] ||
          !searchedItems[i]['shippingInfo'][0]['oneDayShippingAvailable'] ||
          !searchedItems[i]['listingInfo'][0]['bestOfferEnabled'] ||
          !searchedItems[i]['listingInfo'][0]['buyItNowAvailable'] ||
          !searchedItems[i]['listingInfo'][0]['listingType'] ||
          !searchedItems[i]['listingInfo'][0]['gift'] ||
          !searchedItems[i]['listingInfo'][0]['watchCount'] ||
          !searchedItems[i]['viewItemURL'] ||
          !searchedItems[i]['sellingStatus'][0]['currentPrice'])
      {
        numTotalEntries = numTotalEntries - 1;
        length = length - 1;
      }
    }
    // after delete these items losing attributes,
    // check if the current total entries are > 0
    if (numTotalEntries === 0){
      return {'itemCount': 0};
    }
    else{
      // total entries > 0
      itemCount = length;
    }

    // calculate page number
    var page = parseInt(itemCount / 5) + 1;
    if (page >= 20){
      page = 20;
    }
    var formattedArray = [];

    for (var j = 0; j < searchedItems.length; j++){
      if (!searchedItems[j]['title'])
        continue;
      if (!searchedItems[j]['galleryURL'])
        continue;
      if (!searchedItems[j]['condition'])
        continue;
      if (!searchedItems[j]['location'])
        continue;
      if (!searchedItems[j]['primaryCategory'][0]['categoryName'])
        continue;
      if (!searchedItems[j]['condition'][0]['conditionDisplayName'])
        continue;
      if (!searchedItems[j]['shippingInfo'][0]['shippingType'])
        continue;
      if (!searchedItems[j]['shippingInfo'][0]['shippingServiceCost'])
        continue;
      if (!searchedItems[j]['shippingInfo'][0]['shipToLocations'])
        continue;
      if (!searchedItems[j]['shippingInfo'][0]['expeditedShipping'])
        continue;
      if (!searchedItems[j]['shippingInfo'][0]['oneDayShippingAvailable'])
        continue;
      if (!searchedItems[j]['listingInfo'][0]['bestOfferEnabled'])
        continue;
      if (!searchedItems[j]['listingInfo'][0]['buyItNowAvailable'])
        continue;
      if (!searchedItems[j]['listingInfo'][0]['listingType'])
        continue;
      if (!searchedItems[j]['listingInfo'][0]['gift'])
        continue;
      if (!searchedItems[j]['listingInfo'][0]['watchCount'])
        continue;
      if (!searchedItems[j]['viewItemURL'])
        continue;
      if (!searchedItems[j]['sellingStatus'][0]['currentPrice'])
        continue;

      // check if searched img is undefined
      var defaultImg = "https://csci571.com/hw/hw8/images/ebayDefault.png";
      var undefinedImg = "https://thumbs1.ebaystatic.com/pict/04040_0.jpg";

      // if img is undefined, replace it with default display
      if (searchedItems[j]['galleryURL'][0] === undefinedImg) {
        searchedItems[j]['galleryURL'][0] = defaultImg;
      }

      var formatted_object = {
        /* summary info */
        'image': searchedItems[j]['galleryURL'][0],
        'title': searchedItems[j]['title'][0],
        'price': searchedItems[j]['sellingStatus'][0]['currentPrice'][0]["__value__"],
        'location': searchedItems[j]['location'][0],
        'ItemURL':searchedItems[j]['viewItemURL'][0],

        /* basic info */
        'category': searchedItems[j]['primaryCategory'][0]['categoryName'][0],
        'condition': searchedItems[j]['condition'][0]['conditionDisplayName'][0],

        /* shipping info */
        'shippingType': searchedItems[j]['shippingInfo'][0]['shippingType'][0],
        'shippingCost': searchedItems[j]['shippingInfo'][0]['shippingServiceCost'][0]["__value__"],
        'shippingTo': searchedItems[j]['shippingInfo'][0]['shipToLocations'][0],
        'expeditedShipping': searchedItems[j]['shippingInfo'][0]['expeditedShipping'][0],
        'oneDayShippingAvailable': searchedItems[j]['shippingInfo'][0]['oneDayShippingAvailable'][0],

        /* Listing info */
        'bestOfferEnabled': searchedItems[j]['listingInfo'][0]['bestOfferEnabled'][0],
        'buyItNowAvailable': searchedItems[j]['listingInfo'][0]['buyItNowAvailable'][0],
        'listingType': searchedItems[j]['listingInfo'][0]['listingType'][0],
        "gift": searchedItems[j]['listingInfo'][0]['gift'][0],
        "watchCount": searchedItems[j]['listingInfo'][0]['watchCount'][0]

      };
      formattedArray.push(formatted_object);
    }
    //console.log('formattedArray is' + formattedArray);
    var processedData = {'keyword': keyword, 'count': itemCount, 'page': page, 'data': formattedArray};
    console.log('------------');
    console.log(processedData['data'][0]);
    return processedData;
  }
}



app.listen(port, function () {
  console.log("The server is running on at http://localhost:%s", port);
});
