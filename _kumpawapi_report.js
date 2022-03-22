var squel = require("squel");

function report_01()
{

    squel.select()
    .from("report_01")
    .field("weighing_id")
    .field("quota")
    .field("farm_id")
    .field("name")
    .field("zone")
    .field("round")
    .field("harvest")
    .field("cane_contract")
    .field("cane_today")
    .field("type_vehicle")
    .field("vehicle_number")
    .field("fresh_cane")
    .field("fresh_cane_beautiful")
    .field("fresh_cane_contamination")
    .field("fresh_cane_longtop")
    .field("fresh_cane_uncuttop")
    .field("cane_onfire")
    .field("cane_onfire_untie")
    .field("cane_onfire_contamination")
    .field("cane_onfire_longtop")
    .field("cane_onfire_uncuttop")
    .field("date_send_cane")
    .field("status_farm")
    .where("farm_id = 'Thomas'")
    .toString()
  //  WHERE farm_id='15021001001'
}