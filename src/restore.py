from dotenv import load_dotenv
from tkinter import Tk
from tkinter.filedialog import askopenfilename
from os import getenv, system

load_dotenv()

sql_host = getenv('SQL_HOST')
sql_user = getenv('SQL_USER')
sql_passwd = getenv('SQL_PASSWD')
sql_path = getenv('SQL_DUMP_PATH')

restore_path = '{}/mysql.exe'.format(sql_path)

if sql_passwd != None:
    restore_args = '{} -h {} -u {} -p {}'.format(restore_path, sql_host,
                                                 sql_user, sql_passwd)
else:
    restore_args = '{} -h {} -u {}'.format(restore_path, sql_host, sql_user)

Tk().withdraw()
restore_file = askopenfilename()
restore_cmd = '{} < {}'.format(restore_args, restore_file)
print(restore_cmd)
system(restore_cmd)