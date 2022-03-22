


function gen_report_inout_dailay2monthly()
{
    /*
    INSERT INTO rp_enter_geom_monthy(modem_id,total_inout,timeuse
        ,inout_station,inout_allow_zone,inout_notallow_zone
        ,timeuse_station,timeuse_allow_zone,timeuse_notallow_zone,fleet_code,year_month   ) 
        
           SELECT DISTINCT r.modem_id  
             ,x4.xcount as total_inout  
             ,fn_tb_sum_inout_timeuse_geom_by_month(r.modem_id,'2022-01' ) as total_timeuse 
             ,fn_tb_sum_inout_geom_by_month_and_type(r.modem_id, '2022-01','1') as inout_station 
             ,fn_tb_sum_inout_geom_by_month_and_type(r.modem_id, '2022-01','2') as inout_allow_zone 
             ,fn_tb_sum_inout_geom_by_month_and_type(r.modem_id, '2022-01','3') as inout_notallow_zone 
             ,fn_tb_sum_inout_timeuse_geom_by_month_type(r.modem_id, '2022-01','1') as timeuse_station 
             ,fn_tb_sum_inout_timeuse_geom_by_month_type(r.modem_id, '2022-01','2') as timeuse_allow_zone 
             ,fn_tb_sum_inout_timeuse_geom_by_month_type(r.modem_id, '2022-01','3') as timeuse_notallow_zone 
                 ,'23'
                 ,'2022-01'
             FROM	master_config_vehicle as r, setup_vehicle as sv 
             ,fn_tb_sum_inout_geom_by_month(r.modem_id, '2022-02') as x4 
             WHERE r.modem_id=sv.modem_id 
             AND sv.fleetcode=get_fleetid('kmp')
                 AND  r.vehiclename !='1234'
                 AND  x4.xcount > 1
                 */
}