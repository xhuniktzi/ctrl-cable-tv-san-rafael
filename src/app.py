from flask import Flask, Response, render_template, request, session, url_for, jsonify, redirect, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from helpers import serialize_client, serialize_client_service, serialize_village, serialize_service, unserialize_date, serialize_payment, parse_range_month, range_month_from_actual
from forms import RegisterForm, LoginForm
from os import getenv
from datetime import datetime

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = getenv('DATABASE_URI')
app.config['SQLALCHEMY_BINDS'] = {'users': getenv('DATABASE_USERS')}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'my_secret_key'
app.jinja_env.globals.update(datetime=datetime.now())
db = SQLAlchemy(app)


# Modelos de datos
class ClientService(db.Model):
    client_id = db.Column(db.Integer,
                          db.ForeignKey('client.key_id'),
                          primary_key=True)
    service_id = db.Column(db.Integer,
                           db.ForeignKey('service.key_id'),
                           primary_key=True)
    price = db.Column(db.Integer, nullable=False)


class Ubication(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    code = db.Column(db.String(5), nullable=False)


class Client(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    phone = db.Column(db.String(12), nullable=True)
    direction = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(120), nullable=True)
    payment_date = db.Column(db.DateTime, nullable=False)
    payment_group = db.Column(db.String(3), nullable=False)
    internet_speed = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(16), nullable=True)
    router_number = db.Column(db.Integer, nullable=True)
    line_number = db.Column(db.Integer, nullable=True)
    ubication_id = db.Column(db.Integer,
                             db.ForeignKey('ubication.key_id'),
                             nullable=False)
    status = db.Column(db.Boolean, nullable=False, default=True)


class Payment(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    mount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Boolean, nullable=False)
    month = db.Column(db.Integer,
                      db.ForeignKey('month.key_id'),
                      nullable=False)
    year = db.Column(db.Integer, nullable=False)
    service_id = db.Column(db.Integer,
                           db.ForeignKey('service.key_id'),
                           nullable=False)
    client_id = db.Column(db.Integer,
                          db.ForeignKey('client.key_id'),
                          nullable=False)
    datetime = db.Column(db.DateTime, nullable=False)


class Service(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    code = db.Column(db.String(5), nullable=False)
    status = db.Column(db.Boolean, nullable=False)


# Modelo estático de datos
class Month(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(12), nullable=False)


# Datos Login
class User(db.Model):
    __bind_key__ = 'users'
    key_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.now())

    def __init__(self, username: str, passwd: str):
        self.username = username
        self.password = self.__create_passwd(passwd)

    def __create_passwd(self, passwd: str):
        return generate_password_hash(passwd)

    def check_passwd(self, passwd: str):
        return check_password_hash(self.password, passwd)


def is_admin(username: str):
    user = User.query.filter_by(username=username).first()
    return user.is_admin


app.jinja_env.globals.update(is_admin=is_admin)


@app.before_request
def before_request():
    normal_user_endpoints = [
        'static', 'welcome', 'logout_user', 'client_admin', 'register_service',
        'payment', 'orders', 'receipt', 'print_orders', 'get_all_villages',
        'get_all_services', 'get_client', 'post_client', 'post_client_service',
        'search_clients', 'get_data_client', 'get_payments', 'post_payments',
        'put_payments'
    ]
    if ('username' not in session) and (request.endpoint not in ['login_user'
                                                                 ]):
        return redirect(url_for('login_user'))
    elif ('username' in session) and (request.endpoint in ['login_user']):
        return redirect(url_for('welcome'))
    elif ('username' in session) and (request.endpoint
                                      not in normal_user_endpoints):
        user = User.query.filter_by(username=session['username']).first()
        if not user.is_admin:
            return abort(401)


# Authentication
@app.route('/auth/register/', methods=['GET', 'POST'])
def register_user():
    register_form = RegisterForm(request.form)
    if request.method == 'POST' and register_form.validate():
        username = register_form.username.data
        password = register_form.password.data
        check_user = User.query.filter_by(username=username).first()
        if check_user != None:
            return redirect(url_for('welcome'))
        else:
            user = User(username, password)
            user.is_admin = False
            db.session.add(user)
            db.session.commit()

    return render_template('register_user.html', form=register_form)


@app.route('/auth/login/', methods=['GET', 'POST'])
def login_user():
    login_form = LoginForm(request.form)
    if request.method == 'POST' and login_form.validate():
        username = login_form.username.data
        password = login_form.password.data
        user = User.query.filter_by(username=username).first()
        if user != None and user.check_passwd(password):
            session['username'] = username
            return redirect(url_for('welcome'))
        else:
            abort(401)
    return render_template('login_user.html', form=login_form)


@app.route('/auth/logout/')
def logout_user():
    if 'username' in session:
        session.pop('username')
    return redirect(url_for('login_user'))


# Vistas
@app.route('/')
def welcome():
    return render_template('welcome.html')


@app.route('/admin/clients/')
def client_admin():
    return render_template('client_admin.html')


@app.route('/admin/manage-clients/')
def manage_clients():
    return render_template('manage_clients.html')


@app.route('/admin/villages/')
def village_admin():
    return render_template('village_admin.html')


@app.route('/admin/services/')
def service_admin():
    return render_template('service_admin.html')


@app.route('/admin/register-service/')
def register_service():
    return render_template('register_service.html')


@app.route('/admin/list')
def admin_list():
    villages = Ubication.query.all()
    services = Service.query.all()
    return render_template('admin_list.html',
                           villages=villages,
                           services=services)


@app.route('/admin/dashboard/')
def dashboard():
    total_expected: int = 0
    total_payments: int = 0

    clients = Client.query.filter_by(status=True).all()
    for client in clients:
        client_services = ClientService.query.filter_by(
            client_id=client.key_id).all()
        for client_service in client_services:
            total_expected = total_expected + client_service.price

        payments = Payment.query.filter_by(client_id=client.key_id,
                                           month=datetime.now().month).all()
        for payment in payments:
            total_payments = total_payments + payment.mount

    if total_expected > 0:
        progress_percentage = int((total_payments / total_expected) * 100)
    else:
        progress_percentage = 100

    services_info = []

    services = Service.query.all()
    for service in services:
        client_services = ClientService.query.filter_by(
            service_id=service.key_id).all()
        total_service_expected: int = 0
        for client_service in client_services:
            client = Client.query.get(client_service.client_id)
            if client.status:
                total_service_expected = total_service_expected + client_service.price

        total_service_payments: int = 0
        payments = Payment.query.filter_by(service_id=service.key_id,
                                           month=datetime.now().month).all()
        for payment in payments:
            total_service_payments = total_service_payments + payment.mount

        if total_service_expected > 0:
            service_progress_percentage = int(
                (total_service_payments / total_service_expected) * 100)
        else:
            service_progress_percentage = 100

        services_info.append({
            'name': service.name,
            'total_expected': total_service_expected,
            'total_payments': total_service_payments,
            'progress_percentage': service_progress_percentage
        })

    villages_info = []

    villages = Ubication.query.all()
    for village in villages:
        total_village_expected: int = 0
        total_village_payments: int = 0
        clients = Client.query.filter_by(ubication_id=village.key_id,
                                         status=True).all()
        for client in clients:
            client_services = ClientService.query.filter_by(
                client_id=client.key_id).all()
            for client_service in client_services:
                total_village_expected = total_village_expected + client_service.price

            payments = Payment.query.filter_by(
                client_id=client.key_id, month=datetime.now().month).all()
            for payment in payments:
                total_village_payments = total_village_payments + payment.mount

        if total_village_expected > 0:
            village_progress_percentage = int(
                (total_village_payments / total_village_expected) * 100)
        else:
            village_progress_percentage = 100

        villages_info.append({
            'name': village.name,
            'total_expected': total_village_expected,
            'total_payments': total_village_payments,
            'progress_percentage': village_progress_percentage
        })

    return render_template('dashboard.html',
                           total_expected=total_expected,
                           total_payments=total_payments,
                           progress_percentage=progress_percentage,
                           services_info=services_info,
                           villages_info=villages_info)


@app.route('/system/payment/')
def payment():
    return render_template('payment.html')


@app.route('/system/orders/')
def orders():
    return render_template('orders.html')


# Prints
@app.route(
    '/print/standard-receipt/<int:client_id>/<int:service_id>/<int:count>')
def standard_receipt(client_id: int, service_id: int, count: int):
    obj = dict()
    client = Client.query.get(client_id)
    ubication = Ubication.query.get(client.ubication_id)
    service = Service.query.get(service_id)
    client_service = ClientService.query.filter_by(
        client_id=client.key_id, service_id=service.key_id).first()
    obj['name'] = client.name
    obj['ubication'] = ubication.name
    obj['direction'] = client.direction
    obj['description'] = client.description
    obj['internet_speed'] = client.internet_speed
    obj['code'] = '{}-{}'.format(ubication.code, client.key_id)
    obj['service'] = service.name
    obj['list_payments'] = dict()
    obj['message'] = '{} cuotas pagadas'.format(count)
    obj['total'] = count * client_service.price

    year_parcial_payments = Payment.query.filter_by(
        client_id=client.key_id,
        service_id=service.key_id,
        status=False,
        year=datetime.now().year).all()

    year_standard_payments = Payment.query.filter_by(
        client_id=client.key_id,
        service_id=service.key_id,
        status=True,
        year=datetime.now().year).all()

    for payment in year_parcial_payments:
        template = 'Q. {} PEND'.format(client_service.price - payment.mount)
        obj['list_payments'][payment.month] = template

    for payment in year_standard_payments:
        obj['list_payments'][payment.month] = 'PAGADO'

    last_payment = Payment.query.filter_by(
        client_id=client.key_id, service_id=service.key_id).order_by(
            Payment.year.desc()).order_by(Payment.month.desc()).first()

    if last_payment != None:
        now_month = datetime.now().month
        now_year = datetime.now().year

        if service.status:
            now_month = now_month - 1
            if now_month < 1:
                now_month = 12
                now_year = now_year - 1

        if (now_year > last_payment.year) or (
            (now_year == last_payment.year) and
            (now_month > last_payment.month)):
            tmp_month = last_payment.month
            tmp_year = last_payment.year
            count = 0
            while (tmp_month != now_month) or (tmp_year != now_year):
                count = count + 1
                tmp_month = tmp_month + 1
                if tmp_month > 12:
                    tmp_month = 1
                    tmp_year = tmp_year + 1

                if tmp_year == datetime.now().year:
                    obj['list_payments'][tmp_month] = 'PAGAR'

    return render_template('print_standard_receipt.html', obj=obj)


@app.route('/print/parcial-receipt/<int:client_id>', methods=['GET'])
def parcial_receipt(client_id: int):
    payment_codes = request.args.getlist('pay')

    client = Client.query.get(client_id)
    ubication = Ubication.query.get(client.ubication_id)

    list_payments = []

    for code in payment_codes:
        list_payments.append(Payment.query.get(code))

    list_services = []

    for payment in list_payments:
        if not payment.service_id in list_services:
            list_services.append(payment.service_id)

    list_prints = []

    for service_id in list_services:
        obj = dict()
        service = Service.query.get(service_id)
        client_service = ClientService.query.filter_by(
            client_id=client.key_id, service_id=service.key_id).first()

        obj['name'] = client.name
        obj['ubication'] = ubication.name
        obj['direction'] = client.direction
        obj['description'] = client.description
        obj['internet_speed'] = client.internet_speed
        obj['code'] = '{}-{}'.format(ubication.code, client.key_id)
        obj['service'] = service.name
        obj['list_payments'] = dict()

        year_parcial_payments = Payment.query.filter_by(
            client_id=client.key_id,
            service_id=service.key_id,
            status=False,
            year=datetime.now().year).all()

        year_standard_payments = Payment.query.filter_by(
            client_id=client.key_id,
            service_id=service.key_id,
            status=True,
            year=datetime.now().year).all()

        for payment in year_parcial_payments:
            template = 'Q. {} PEND'.format(client_service.price -
                                           payment.mount)
            obj['list_payments'][payment.month] = template

        for payment in year_standard_payments:
            obj['list_payments'][payment.month] = 'PAGADO'

        last_payment = Payment.query.filter_by(
            client_id=client.key_id, service_id=service.key_id).order_by(
                Payment.year.desc()).order_by(Payment.month.desc()).first()

        if last_payment != None:
            now_month = datetime.now().month
            now_year = datetime.now().year

        if service.status:
            now_month = now_month - 1
            if now_month < 1:
                now_month = 12
                now_year = now_year - 1

        if (now_year > last_payment.year) or (
            (now_year == last_payment.year) and
            (now_month > last_payment.month)):
            tmp_month = last_payment.month
            tmp_year = last_payment.year
            count = 0
            while (tmp_month != now_month) or (tmp_year != now_year):
                count = count + 1
                tmp_month = tmp_month + 1
                if tmp_month > 12:
                    tmp_month = 1
                    tmp_year = tmp_year + 1

                if tmp_year == datetime.now().year:
                    obj['list_payments'][tmp_month] = 'PAGAR'

        obj['total'] = 0

        count = 0
        for payment in list_payments:
            if payment.service_id == service.key_id:
                count = count + 1
                obj['total'] = obj['total'] + payment.mount

        obj['message'] = '{} pagos procesados'.format(count)

        list_prints.append(obj)

    # print(list_prints)
    return render_template('print_parcial_receipt.html',
                           list_prints=list_prints)


@app.route('/print/orders')
def print_orders():
    get_payment_status = request.args.get('payment_status', type=str)
    get_village = request.args.get('ubication_id', type=int)

    clients = []
    if get_payment_status != '' and get_village != None:
        clients = Client.query.filter_by(payment_group=get_payment_status,
                                         ubication_id=get_village,
                                         status=True).order_by(
                                             Client.ubication_id.desc()).all()

    elif get_payment_status != '' and get_village == None:
        clients = Client.query.filter_by(payment_group=get_payment_status,
                                         status=True).order_by(
                                             Client.ubication_id.desc()).all()

    elif get_payment_status == '' and get_village != None:
        clients = Client.query.filter_by(ubication_id=get_village,
                                         status=True).all()

    elif get_payment_status == '' and get_village == None:
        clients = Client.query.filter_by(status=True).order_by(
            Client.ubication_id.desc()).all()

    data = []

    for client in clients:
        client_services = ClientService.query.filter_by(
            client_id=client.key_id)
        for client_service in client_services:
            service = Service.query.get(client_service.service_id)

            last_payment = Payment.query.filter_by(
                client_id=client.key_id, service_id=service.key_id).order_by(
                    Payment.year.desc()).order_by(
                        Payment.month.desc()).first()

            if last_payment == None:
                continue  # Break if not payments

            obj_order = {
                'name':
                client.name,
                'ubication':
                Ubication.query.get(client.ubication_id).name,
                'direction':
                client.direction,
                'description':
                client.description,
                'service':
                service.name,
                'internet_speed':
                client.internet_speed,
                'code':
                '{}-{}'.format(
                    Ubication.query.get(client.ubication_id).code,
                    client.key_id),
                'total':
                0,
                'list_payments':
                dict(),
                'messages':
                list(),
            }

            year_parcial_payments = Payment.query.filter_by(
                client_id=client.key_id,
                service_id=service.key_id,
                status=False,
                year=datetime.now().year).all()

            for payment in year_parcial_payments:
                template = 'Q. {} PEND'
                message = template.format(client_service.price - payment.mount)
                obj_order['list_payments'][payment.month] = message
                obj_order['total'] = obj_order['total'] + \
                    (client_service.price - payment.mount)

            year_standard_payments = Payment.query.filter_by(
                client_id=client.key_id,
                service_id=service.key_id,
                status=True,
                year=datetime.now().year).all()

            for payment in year_standard_payments:
                obj_order['list_payments'][payment.month] = 'PAGADO'

            other_parcial_payments = Payment.query.filter_by(
                client_id=client.key_id,
                service_id=service.key_id,
                status=False).filter(
                    Payment.year != datetime.now().year).all()

            for payment in other_parcial_payments:
                mount = client_service.price - payment.mount
                msg = 'Pend. {} {}, Q. {}'
                info = msg.format(
                    Month.query.get(payment.month).name, payment.year, mount)
                obj_order['messages'].append(info)
                obj_order['total'] = obj_order['total'] + \
                    (client_service.price - payment.mount)

            now_month = datetime.now().month
            now_year = datetime.now().year

            if service.status:
                now_month = now_month - 1
                if now_month < 1:
                    now_month = 12
                    now_year = now_year - 1

            if (now_year > last_payment.year) or (
                (now_year == last_payment.year) and
                (now_month > last_payment.month)):
                tmp_month = last_payment.month
                tmp_year = last_payment.year
                count = 0
                while (tmp_month != now_month) or (tmp_year != now_year):
                    count = count + 1
                    tmp_month = tmp_month + 1
                    if tmp_month > 12:
                        tmp_month = 1
                        tmp_year = tmp_year + 1

                    if tmp_year == datetime.now().year:
                        obj_order['list_payments'][tmp_month] = 'PAGAR'

                    obj_order['total'] = obj_order['total'] + \
                        client_service.price

                if count > 1:
                    first_month = last_payment.month + 1
                    first_year = last_payment.year
                    if first_month > 12:
                        first_month = 1
                        first_year = first_year + 1

                    msg = '{} cuotas desde {}/{} hasta {}/{}'
                    info = msg.format(count,
                                      Month.query.get(first_month).name,
                                      first_year,
                                      Month.query.get(now_month).name,
                                      now_year)
                    obj_order['messages'].append(info)
                else:
                    msg = 'cuota de {}/{}'.format(
                        Month.query.get(now_month).name, now_year)
                    obj_order['messages'].append(msg)

            if obj_order['total'] != 0:
                data.append(obj_order)

    return render_template('print_orders.html', data=data)


@app.route('/print/list')
def print_list():
    def define_month_context(client, service, range_month: dict):
        return {
            'prev_3':
            'x' if Payment.query.filter_by(
                client_id=client,
                service_id=service,
                month=range_month['prev_3']).first() != None else '',
            'prev_2':
            'x' if Payment.query.filter_by(
                client_id=client,
                service_id=service,
                month=range_month['prev_2']).first() != None else '',
            'prev_1':
            'x' if Payment.query.filter_by(
                client_id=client,
                service_id=service,
                month=range_month['prev_1']).first() != None else '',
            'act':
            'x' if Payment.query.filter_by(
                client_id=client, service_id=service,
                month=range_month['act']).first() != None else '',
            'next_1':
            'x' if Payment.query.filter_by(
                client_id=client,
                service_id=service,
                month=range_month['next_1']).first() != None else '',
            'next_2':
            'x' if Payment.query.filter_by(
                client_id=client,
                service_id=service,
                month=range_month['next_2']).first() != None else ''
        }

    ubication_id = request.args.get('ubication', type=int)
    service_id = request.args.get('service', type=int)

    act_month = datetime.now().month
    range_month = range_month_from_actual(act_month)
    month_context = parse_range_month(range_month)

    clients = None
    list_context = []

    if ubication_id == None:
        clients = Client.query.all()
    else:
        clients = Client.query.filter_by(ubication_id=ubication_id)

    if service_id == None:
        count = 0
        for client in clients:
            ubication = Ubication.query.get(client.ubication_id)
            client_services = ClientService.query.filter_by(
                client_id=client.key_id).all()
            for client_service in client_services:
                count = count + 1
                service = Service.query.get(client_service.service_id)
                list_context.append({
                    'count':
                    count,
                    'code':
                    '{}-{}'.format(ubication.code, client.key_id),
                    'name':
                    client.name,
                    'ip_address':
                    client.ip_address,
                    'internet_speed':
                    client.internet_speed,
                    'price':
                    client_service.price,
                    'ubication':
                    ubication.name,
                    'service':
                    service.name,
                    'payments':
                    define_month_context(client.key_id, service.key_id,
                                         range_month)
                })

    elif Service.query.get(service_id).name == 'Internet':
        count = 0
        for client in clients:
            ubication = Ubication.query.get(client.ubication_id)
            count = count + 1
            service = Service.query.get(service_id)
            client_service = ClientService.query.filter_by(
                client_id=client.key_id, service_id=service.key_id).first()

            if client_service != None:
                list_context.append({
                    'count':
                    count,
                    'code':
                    '{}-{}'.format(ubication.code, client.key_id),
                    'name':
                    client.name,
                    'ip_address':
                    client.ip_address,
                    'internet_speed':
                    client.internet_speed,
                    'price':
                    client_service.price,
                    'ubication':
                    ubication.name,
                    'service':
                    service.name,
                    'payments':
                    define_month_context(client.key_id, service.key_id,
                                         range_month)
                })

    elif Service.query.get(service_id).name == 'Internet + Tv':
        count = 0
        for client in clients:
            ubication = Ubication.query.get(client.ubication_id)
            count = count + 1
            service = Service.query.get(service_id)
            client_service = ClientService.query.filter_by(
                client_id=client.key_id, service_id=service.key_id).first()

            if client_service != None:
                list_context.append({
                    'count':
                    count,
                    'code':
                    '{}-{}'.format(ubication.code, client.key_id),
                    'name':
                    client.name,
                    'ip_address':
                    client.ip_address,
                    'internet_speed':
                    client.internet_speed,
                    'price':
                    client_service.price,
                    'ubication':
                    ubication.name,
                    'service':
                    service.name,
                    'payments':
                    define_month_context(client.key_id, service.key_id,
                                         range_month)
                })

    elif Service.query.get(service_id).name == 'TV':
        count = 0
        for client in clients:
            ubication = Ubication.query.get(client.ubication_id)
            count = count + 1
            service = Service.query.get(service_id)
            client_service = ClientService.query.filter_by(
                client_id=client.key_id, service_id=service.key_id).first()

            if client_service != None:
                list_context.append({
                    'count':
                    count,
                    'code':
                    '{}-{}'.format(ubication.code, client.key_id),
                    'name':
                    client.name,
                    'ip_address':
                    client.ip_address,
                    'internet_speed':
                    client.internet_speed,
                    'price':
                    client_service.price,
                    'ubication':
                    ubication.name,
                    'service':
                    service.name,
                    'payments':
                    define_month_context(client.key_id, service.key_id,
                                         range_month)
                })
        return render_template('print_list_2.html',
                               list_context=list_context,
                               month_context=month_context)

    return render_template('print_list.html',
                           list_context=list_context,
                           month_context=month_context)


# API
@app.route('/api/v1/villages', methods=['GET'])
def get_all_villages():
    villages = Ubication.query.all()
    village_list = []
    for village in villages:
        village_element = serialize_village(village)
        village_list.append(village_element)
    return jsonify(village_list)


@app.route('/api/v1/villages/<int:id>', methods=['GET'])
def get_village(id: int):
    village = Ubication.query.get(id)
    return jsonify(serialize_village(village))


@app.route('/api/v1/villages', methods=['POST'])
def post_village():
    new_village = Ubication()
    new_village.name = request.json['name']
    new_village.code = request.json['code']

    db.session.add(new_village)
    db.session.commit()
    return jsonify(serialize_village(new_village))


@app.route('/api/v1/villages/<int:id>', methods=['PUT'])
def put_village(id: int):
    village = Ubication.query.get(id)
    village.name = request.json['name']
    village.code = request.json['code']
    db.session.commit()
    return jsonify(serialize_village(village))


@app.route('/api/v1/villages/<int:id>', methods=['DELETE'])
def delete_village(id: int):
    village = Ubication.query.get(id)
    db.session.delete(village)
    db.session.commit()
    return jsonify(serialize_village(village))


@app.route('/api/v1/services', methods=['GET'])
def get_all_services():
    services = Service.query.all()
    service_list = []
    for service in services:
        service_element = serialize_service(service)
        service_list.append(service_element)
    return jsonify(service_list)


@app.route('/api/v1/services/<int:id>', methods=['GET'])
def get_service(id: int):
    service = Service.query.get(id)
    return jsonify(serialize_service(service))


@app.route('/api/v1/services', methods=['POST'])
def post_service():
    new_service = Service()
    new_service.name = request.json['name']
    new_service.code = request.json['code']
    new_service.status = request.json['status']
    db.session.add(new_service)
    db.session.commit()
    return jsonify(serialize_service(new_service))


@app.route('/api/v1/services/<int:id>', methods=['PUT'])
def put_service(id: int):
    service = Service.query.get(id)
    service.name = request.json['name']
    service.code = request.json['code']
    db.session.commit()
    return jsonify(serialize_service(service))


@app.route('/api/v1/services/<int:id>', methods=['DELETE'])
def delete_service(id: int):
    service = Service.query.get(id)
    db.session.delete(service)
    db.session.commit()
    return jsonify(serialize_service(service))


@app.route('/api/v1/clients', methods=['GET'])
def get_all_clients():
    clients = Client.query.all()
    client_list = []
    for client in clients:
        client_element = serialize_client(client)
        client_list.append(client_element)
    return jsonify(client_list)


@app.route('/api/v1/clients/<int:id>', methods=['GET'])
def get_client(id: int):
    client = Client.query.get(id)
    return jsonify(serialize_client(client))


@app.route('/api/v1/clients', methods=['POST'])
def post_client():
    new_client = Client()
    new_client.name = request.json['name']
    new_client.phone = request.json['phone']
    new_client.direction = request.json['direction']
    new_client.description = request.json['description']
    new_client.payment_date = unserialize_date(request.json['payment_date'])
    new_client.payment_group = request.json['payment_group']
    new_client.internet_speed = request.json['internet_speed']
    new_client.ip_address = request.json['ip_address']
    new_client.router_number = request.json['router_number']
    new_client.line_number = request.json['line_number']
    new_client.ubication_id = request.json['ubication_id']
    db.session.add(new_client)
    db.session.commit()
    return jsonify(serialize_client(new_client))


@app.route('/api/v1/clients/<int:id>', methods=['PUT'])
def put_client(id: int):
    client = Client.query.get(id)
    client.name = request.json['name']
    client.phone = request.json['phone']
    client.direction = request.json['direction']
    client.description = request.json['description']
    client.payment_date = unserialize_date(request.json['payment_date'])
    client.payment_group = request.json['payment_group']
    client.internet_speed = request.json['internet_speed']
    client.ip_address = request.json['ip_address']
    client.router_number = request.json['router_number']
    client.line_number = request.json['line_number']
    client.ubication_id = request.json['ubication_id']
    db.session.commit()
    return jsonify(serialize_client(client))


@app.route('/api/v1/clients/<int:id>', methods=['DELETE'])
def delete_client(id: int):
    client = Client.query.get(id)
    ClientService.query.filter_by(client_id=client.key_id).delete()
    Payment.query.filter_by(client_id=client.key_id).delete()
    db.session.delete(client)
    db.session.commit()
    return jsonify(serialize_client(client))


@app.route('/api/v1/clients/<int:id>', methods=['PATCH'])
def patch_client(id: int):
    client = Client.query.get(id)
    client.status = request.json['status']
    db.session.commit()
    return jsonify(serialize_client(client))


@app.route('/api/v1/client-services', methods=['POST'])
def post_client_service():
    new_client_service = ClientService()
    new_client_service.client_id = request.json['client_id']
    new_client_service.service_id = request.json['service_id']
    new_client_service.price = request.json['price']
    db.session.add(new_client_service)
    db.session.commit()
    return jsonify(serialize_client_service(new_client_service))


@app.route('/api/v1/client-services/<int:client_id>/<int:service_id>',
           methods=['DELETE'])
def delete_client_service(client_id: int, service_id: int):
    client = Client.query.get(client_id)
    service = Service.query.get(service_id)
    client_service = ClientService.query.filter_by(
        client_id=client.key_id, service_id=service.key_id).first()
    Payment.query.filter_by(client_id=client.key_id,
                            service_id=service.key_id).delete()
    db.session.delete(client_service)
    db.session.commit()
    return jsonify(serialize_client_service(client_service))


# Super API
@app.route('/api/v2/search/clients', methods=['GET'])
def search_clients():
    get_name = request.args.get('name', type=str)
    get_village = request.args.get('ubication_id', type=int)
    clients = []
    list_clients = []
    if get_name != None and get_village != None:
        search_name = "%{}%".format(get_name)
        clients = Client.query.filter(
            Client.name.like(search_name),
            Client.ubication_id == get_village).order_by(
                Client.ubication_id.asc()).all()

    elif get_name != None and get_village == None:
        search_name = "%{}%".format(get_name)
        clients = Client.query.filter(Client.name.like(search_name)).order_by(
            Client.ubication_id.asc()).all()

    elif get_name == None and get_village != None:
        clients = Client.query.filter(Client.ubication_id == get_village).all()

    for client in clients:
        ubication_client = Ubication.query.get(client.ubication_id)
        client_element = serialize_client(client)
        client_element['ubication'] = serialize_village(ubication_client)
        del client_element['ubication_id']
        list_clients.append(client_element)
    return jsonify(list_clients)


@app.route('/api/v2/clients/<int:id>', methods=['GET'])
def get_data_client(id: int):
    client = Client.query.get(id)
    client_element = serialize_client(client)
    ubication_client = Ubication.query.get(client.ubication_id)
    client_element['ubication'] = serialize_village(ubication_client)
    del client_element['ubication_id']
    service_list = []
    services = ClientService.query.filter_by(client_id=client.key_id).all()
    for service in services:
        service_element = serialize_client_service(service)
        service_info = Service.query.get(service.service_id)
        service_element['name'] = service_info.name
        service_element['code'] = service_info.code
        service_element['id'] = service.service_id
        del service_element['service_id']
        del service_element['client_id']
        service_list.append(service_element)
        client_element['services'] = service_list
    return jsonify(client_element)


@app.route('/api/v2/payments/<int:id>', methods=['GET'])
def get_payments(id: int):
    client = Client.query.get(id)
    payments = Payment.query.filter_by(client_id=client.key_id).order_by(
        Payment.year.desc()).order_by(Payment.month.desc()).order_by(
            Payment.service_id.desc()).all()
    list_payments = []
    for payment in payments:
        payment_element = serialize_payment(payment)
        del payment_element['client_id']
        del payment_element['service_id']
        month = Month.query.get(payment.month)
        payment_element['month'] = month.name
        service = Service.query.get(payment.service_id)
        payment_element['service'] = serialize_service(service)
        client_service = ClientService.query.filter_by(
            client_id=client.key_id, service_id=service.key_id).first()
        payment_element['service']['price'] = client_service.price
        list_payments.append(payment_element)
    return jsonify(list_payments)


@app.route('/api/v2/payments', methods=['POST'])
def post_payments():
    client = Client.query.get(request.json['client_id'])
    service = Service.query.get(request.json['service_id'])
    client_service = ClientService.query.filter_by(
        service_id=service.key_id, client_id=client.key_id).first()
    last_payment = Payment.query.filter_by(
        client_id=client.key_id, service_id=service.key_id).order_by(
            Payment.year.desc()).order_by(Payment.month.desc()).first()
    month = 0
    year = 0

    if last_payment == None:
        now = datetime.now()
        month = now.month
        year = now.year
    else:
        month = last_payment.month + 1
        year = last_payment.year
        if month > 12:
            month = 1
            year = year + 1

    list_payments = []
    if client_service != None:
        i = 0
        count = int(request.json['count'])
        while count > i:
            new_payment = Payment()
            new_payment.datetime = datetime.now()
            new_payment.mount = client_service.price
            new_payment.status = True
            new_payment.service_id = service.key_id
            new_payment.client_id = client.key_id

            new_payment.month = month
            new_payment.year = year

            month = month + 1

            if month > 12:
                month = 1
                year = year + 1

            db.session.add(new_payment)
            db.session.commit()
            list_payments.append(serialize_payment(new_payment))
            i = i + 1

    return jsonify(list_payments)


@app.route('/api/v2/payments/<int:id>', methods=['PUT'])
def put_payments(id: int):
    client = Client.query.get(id)
    payments = request.json
    list_payments = []
    for pay in payments:
        service = Service.query.get(int(pay['service_id']))
        registered_payments = Payment.query.filter_by(client_id=client.key_id)
        month = Month.query.get(int(pay['month']))
        year = int(pay['year'])
        client_service = ClientService.query.filter_by(
            client_id=client.key_id, service_id=service.key_id).first()

        flag = False
        if registered_payments != None:
            for check_pay in registered_payments:
                if ((check_pay.month == int(pay['month']))
                        and (check_pay.year == int(pay['year']))
                        and (check_pay.service_id == int(pay['service_id']))):
                    flag = True
                    break

        if client_service != None:
            if flag:
                payment = Payment.query.filter_by(client_id=client.key_id,
                                                  service_id=service.key_id,
                                                  month=month.key_id,
                                                  year=year).first()
                mount = payment.mount + int(pay['mount'])
                if client_service != None:
                    status = bool(mount >= client_service.price)
                payment.mount = mount
                payment.status = status
                payment.datetime = datetime.now()
                db.session.commit()
                list_payments.append(serialize_payment(payment))
            else:
                new_payment = Payment()
                mount = int(pay['mount'])
                if client_service != None:
                    status = bool(mount >= client_service.price)
                new_payment.mount = mount
                new_payment.status = status
                new_payment.month = month.key_id
                new_payment.year = year
                new_payment.service_id = service.key_id
                new_payment.client_id = client.key_id
                new_payment.datetime = datetime.now()
                db.session.add(new_payment)
                db.session.commit()
                list_payments.append(serialize_payment(new_payment))

    return jsonify(list_payments)


@app.route('/api/v2/payments/<int:id>', methods=['DELETE'])
def delete_payments(id: int):
    payment = Payment.query.get(id)
    db.session.delete(payment)
    db.session.commit()
    return jsonify(serialize_payment(payment))


if __name__ == '__main__':
    db.create_all()
    app.run(host='0.0.0.0', ssl_context='adhoc')