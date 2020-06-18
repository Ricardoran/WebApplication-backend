const express = require('express');
const https = require("https");
const url = require("url");
const request = require("request");
const axios = require('axios');
const app = express();
var keyword = '';

const api_key = "HaoranZh-RicardoZ-PRD-42eb84a53-e0284ef5";



app.get('/search', function (req, res) {
    const url_req = "https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=HaoranZh-RicardoZ-PRD-42eb84a53-e0284ef5&RESPONSE-DATA-FORMAT=JSON&keywords=mask&sortOrder=PricePlusShippingHighest&itemFilter%280%29.name=MaxPrice&itemFilter%280%29.value=50&itemFilter%280%29.paramName=Currency&itemFilter%280%29.paramValue=USD&itemFilter%281%29.name=MinPrice&itemFilter%281%29.value=30&itemFilter%281%29.paramName=Currency&itemFilter%281%29.paramValue=USD&itemFilter%282%29.name=ReturnAcceptedOnly&itemFilter%282%29.value=false&itemFilter%283%29.name=Condition&itemFilter%283%29.value%280%29=1000&itemFilter%284%29.name=FreeShippingOnly&itemFilter%284%29.value=false&itemFilter%285%29.name=ExpeditedShippingType&itemFilter%285%29.value=Expedited";
    https.get(url_req, function (response) {
        //console.log(response);
        var txt = "";
        var q = url.parse(url_req, true);
        console.log('status code ' + response.statusCode);
        console.log('headers:' + response.headers);

        console.log("url_req is ");
        console.log(url_req);
        console.log('--------------');
        console.log("host is: ");
        console.log(q.host);
        console.log('--------------');
        console.log("pathname is: ");
        console.log(q.pathname);
        console.log('--------------');
        console.log("search is: ");
        console.log(q.search);

        var q_data = q.query;

        console.log('--------------');
        console.log("object is: ");
        console.log(q_data);

        console.log(q_data.sortOrder);

        // response.on("data", function (data) {
        //     txt += data;
        //
        //     console.log(JSON.parse(data));
        //     //var item_data = JSON.parse(data);
        //     //console.log(item_data);
        //     //JSON.stringify()
        // });
    });

    res.send("The server is running")
 });


app.get('/', function (req,res) {

    // set http headers
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // define payload
    var url_api = "";
    const url_api_endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';

    url_api += url_api_endpoint;

    // add default params
    url_api += "?OPERATION-NAME=findItemsAdvanced";

    url_api += "?SERVICE-VERSION=1.0.0";

    url_api += "SECURITY-APPNAME=";

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
    url_api += sort_order;
    console.log('sort_order is' + sort_order);


    /*************get input price range (min and max)**************/
    var  min_price= data.input_min;
    console.log('min value is' + min_price);
    var  max_price= data.input_max;
    console.log('max value is' + max_price);


    // if these two ranges are not none, feed different params into them
    if (min_price){
        url_api += "&itemFilter(" + index + ").name = MinPrice";
        url_api += "&itemFilter(" + index + ").value=" + min_price;
        url_api += "&itemFilter(" + index + ").paramName=Currency";
        url_api += "&itemFilter(" + index + ").paramValue=USD";
        index++;

    }

    if (max_price){
        url_api += "&itemFilter(" + index + ").name = MinPrice";
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
        url_api += '&itemFilter('+index + ').name = Condition';
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
        url_api += '&itemFilter(' + index + ').name = ReturnsAcceptedOnly';
        url_api += '&itemFilter(' + index + ').value = true';
        index += 1;
    }
    else{
        url_api += '&itemFilter(' + index + ').name = ReturnsAcceptedOnly';
        url_api += '&itemFilter(' + index + ').value = false';
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
                    url_api +=  '&itemFilter' + index + ").name=ExpeditedShippingType";
                    index ++;
                    checkIfFree = true;
                }
            }
        }
        else {
            // free_shipping only has one element
            if (free_shipping == 'expedited'){
                url_api += '&itemFilter(' + index + ').name = ExpeditedShippingType';
                url_api += '&itemFilter(' + index + ').value = Expedited';
                index ++;
            }
            if (free_shipping == 'free'){
                url_api += '&itemFilter(' + index + ').name = FreeShippingOnly';
                url_api += '&itemFilter(' + index + ').value = true';
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
        itemCount = 0;
    }
    else {
        // success
        numTotalEntries = data['findItemsAdvancedResponse'][0]['paginationOutput'][0]['totalEntries'];
        searchedItems = data['findItemsAdvancedResponse'][0]['searchResult'][0]['item']
    }

    if (!searchedItems || numTotalEntries === 0){
        return {'itemCount': 0};
    }else {
        // in this case, total entries > 0 and searchedItem exists
        length = searchedItems.length;
        for (var i = 0; i < searchedItems.length; i++){
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
        if (numTotalEntries == 0){
            return {'itemCount': 0};
        }
        else{
            itemCount = length;
        }

        // calculate page number
        var page = parseInt(itemCount / 5) + 1;
        var temp = [];

        for (var j = 0; j < searchedItems.length; j++){
            if (!searchedItems[i]['title']) continue;
            if (!searchedItems[i]['galleryURL']) continue;
            if (!searchedItems[i]['condition']) continue;
            if (!searchedItems[i]['location']) continue;
            if (!searchedItems[i]['primaryCategory'][0]['categoryName']) continue;
            if (!searchedItems[i]['condition'][0]['conditionDisplayName']) continue;
            if (!searchedItems[i]['shippingInfo'][0]['shippingType']) continue;
            if (!searchedItems[i]['shippingInfo'][0]['shippingServiceCost']) continue;
            if (!searchedItems[i]['shippingInfo'][0]['shipToLocations']) continue;
            if (!searchedItems[i]['shippingInfo'][0]['expeditedShipping']) continue;
            if (!searchedItems[i]['shippingInfo'][0]['oneDayShippingAvailable']) continue;
            if (!searchedItems[i]['listingInfo'][0]['bestOfferEnabled']) continue;
            if (!searchedItems[i]['listingInfo'][0]['buyItNowAvailable']) continue;
            if (!searchedItems[i]['listingInfo'][0]['listingType']) continue;
            if (!searchedItems[i]['listingInfo'][0]['gift']) continue;
            if (!searchedItems[i]['listingInfo'][0]['watchCount']) continue;
            if (!searchedItems[i]['viewItemURL']) continue;
            if (!searchedItems[i]['sellingStatus'][0]['currentPrice']) continue;

            var defaultImg = "https://csci571.com/hw/hw8/images/ebayDefault.png";
            var undefinedImg = "https://thumbs1.ebaystatic.com/pict/04040_0.jpg";

            // if img is undefined, replace it with default display
            if (searchedItems[i]['galleryURL'][0] === undefinedImg) {
                searchedItems[i]['galleryURL'][0] = defaultImg;
            }

            var formatted_object = {
                /* summary info */
                'image': searchedItems[i]['galleryURL'][0],
                'title': searchedItems[i]['title'][0],
                'price': searchedItems[i]['sellingStatus'][0]['currentPrice'][0]["__value__"],
                'location': searchedItems[i]['location'][0],

                /* basic info */
                'category': searchedItems[i]['primaryCategory'][0]['categoryName'][0],
                'condition': searchedItems[i]['condition'][0]['conditionDisplayName'][0],

                /* shipping info */
                'shippingType': searchedItems[i]['shippingInfo'][0]['shippingType'][0],
                'shippingCost': searchedItems[i]['shippingInfo'][0]['shippingServiceCost'][0]["__value__"],
                'shippingTo': searchedItems[i]['shippingInfo'][0]['shipToLocations'][0],
                'expeditedShipping': searchedItems[i]['shippingInfo'][0]['expeditedShipping'][0],
                'oneDayShippingAvailable': searchedItems[i]['shippingInfo'][0]['oneDayShippingAvailable'][0],

                /* Listing info */
                'bestOfferEnabled': searchedItems[i]['listingInfo'][0]['bestOfferEnabled'][0],
                'buyItNowAvailable': searchedItems[i]['listingInfo'][0]['buyItNowAvailable'][0],
                'listingType': searchedItems[i]['listingInfo'][0]['listingType'][0],
                "gift": searchedItems[i]['listingInfo'][0]['gift'][0],
                "watchCount": searchedItems[i]['listingInfo'][0]['watchCount'][0]

            };
            temp.push(formatted_object);
        }
        return {'keyword': keyword, 'count': itemCount, 'page': page, 'data': temp};
    }
}



app.listen(3000, function () {
    console.log("The server is running on at http://localhost:3000");
});
