

function getcon_localtunnel(callback) {


    var config = {
        "camera":
        {
             "server":"http://61.91.14.253:8003/api/"
            //"server": "http://127.0.0.1:9003/api/"
            ,"api_name": "set_url_multicamera"
            ,"port": 8081
            ,'fleetid': 'db_10005'
            ,"modem_id": '1010005002'
        },
        "version": {
            "id": "1"
        }

    };

    callback(config);
    return;


}
exports.getcon_localtunnel = getcon_localtunnel;
