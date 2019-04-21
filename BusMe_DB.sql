
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

delete from pass_info where stop_name = "Calvary First Church";
 
select * from pass_info;

delete from pass_info where stop_name = "N. First St. & Walnut Ave.";

SELECT EXISTS(SELECT * FROM pass_info WHERE stop_name = "Alpine & Grange Ave EB");

update pass_info 
SET num_pass = 9
WHERE stop_name = "W. Las Palmas Ave. & Ward Ave."


