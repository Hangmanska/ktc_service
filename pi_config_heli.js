function getcon_config(callback) 
{
    var config = {
        "service":
        {
             "server_ip":"128.199.176.174"
            ,"service_api":"http://128.199.176.174:8003/api/"
            ,"api_name": "set_data_sensor_temp"
            ,"id_server":"7"
        },
        "version": {
            "id": "1"
        }

    };

    callback(config);
    return;


}
exports.getcon_config = getcon_config;
