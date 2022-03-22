
//over speed
/*
      SELECT gps_datetime,lon,lat,speed,satelites,altitude
,message_id,analog_input1,analog_input2
,mileage,tambol,amphur,province
,status,heading
 FROM ht_1010001004 
WHERE gps_datetime >='2016-06-04 00:00' 
AND gps_datetime <='2016-06-04 23:59' 
AND status ='3' AND satelites >'0'
AND speed > 90


SELECT TOP 1000 [ingID]
      ,[GPSID]
      ,[StartDate]
      ,[EndDate]
      ,[StartLocation]
      ,[EndLocation]
      ,[Distance]
      ,[AVGSpeed]
      ,[MaxSpeed]
      ,[TimeUse]
      ,[StartMileage]
      ,[EndMileage]
      ,[SetSpeed]
  FROM [Reports].[dbo].[tbm_Events_OverSpeed]

ingID	GPSID	StartDate	EndDate	StartLocation	EndLocation	Distance	AVGSpeed	MaxSpeed	TimeUse	StartMileage	EndMileage	SetSpeed
2	2010001001	2010-01-01 14:39:00.000	2010-01-01 14:39:00.000	วัดท้องคุ้ง:225:คลองพระอุดม ปากเกร็ด:นนทบุรี	วัดท้องคุ้ง:225:คลองพระอุดม ปากเกร็ด:นนทบุรี	0.00	117	117	0	9209.233	9209.233	100
3	2010001001	2010-01-01 14:42:00.000	2010-01-01 14:47:00.000	หมู่บ้านดิเอมเมอรัลการ์เด้น แอนด์สปอร์ตคลับ:399:อ้อมเกร็ด ปากเกร็ด:นนทบุรี	หมู่บ้านมัณฑนา:156:บางกร่าง เมืองนนทบุรี:นนทบุรี	9.13	111	117	5	9213.277	9222.41	100
4	2010001001	2010-01-01 14:49:00.000	2010-01-01 14:49:00.000	หมู่บ้านสีวลี:66:บางขุนกอง บางกรวย:นนทบุรี	หมู่บ้านสีวลี:66:บางขุนกอง บางกรวย:นนทบุรี	0.00	108	108	0	9225.056	9225.056	100

 */