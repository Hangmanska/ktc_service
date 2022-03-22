

function getcon_localtunnel(callback) {


    var config = {
        "camera":
        {
             "server":"http://61.91.14.253:8003/api/"
            //"server": "http://127.0.0.1:9003/api/"
            ,"api_name": "set_urlcamera_x"
            ,"port": 8080
            ,'fleetid': 'db_10005'
            ,"camera_id": '1010005002'
        },
         "is_infarm":
        {   
            //"server":"http://127.0.0.1:9003/api/"
           "server":"http://61.91.14.253:8003/api/"
            , "api_name": "get_picture_infarm"
            , "api_quey": "is_infarm"
            , "api_uppic": "retrive_picsnap_from_pi"
        },
        "version": {
            "id": "1"
        }

    };

    callback(config);
    return;


}
exports.getcon_localtunnel = getcon_localtunnel;
