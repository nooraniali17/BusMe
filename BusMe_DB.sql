
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

delete from pass_info where stop_name = "Calvary First Church";

select * from pass_info