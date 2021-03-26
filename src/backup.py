from dotenv import load_dotenv
from os import getenv, system
from datetime import datetime

load_dotenv()

sql_host = getenv('SQL_HOST')
sql_user = getenv('SQL_USER')
sql_passwd = getenv('SQL_PASSWD')
sql_path = getenv('SQL_DUMP_PATH')
folder_backup = getenv('FOLDER_BACKUP')

backup_path = '{}/mysqldump.exe --add-drop-database --databases'.format(
    sql_path)

if sql_passwd != None:
    backup_args = '{} -h{} -u{} -p{}'.format(backup_path, sql_host, sql_user,
                                             sql_passwd)
else:
    backup_args = '{} -h{} -u{}'.format(backup_path, sql_host, sql_user)

now_time = datetime.now()
date_info = '{}{}{}'.format(now_time.day, now_time.month, now_time.year)

data_backup_cmd = '{} cable_test > {}/cable_test_{}.sql'.format(
    backup_args, folder_backup, date_info)
user_backup_cmd = '{} cable_users > {}/cable_users_{}.sql'.format(
    backup_args, folder_backup, date_info)

print(data_backup_cmd)
print(user_backup_cmd)
system(data_backup_cmd)
system(user_backup_cmd)
