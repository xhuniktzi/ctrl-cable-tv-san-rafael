from flask import Flask, render_template, request, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from helpers import serialize_client, serialize_client_service, serialize_village, serialize_service, unserialize_date, serialize_payment
import os
from datetime import datetime

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'my_secret_key'
db = SQLAlchemy(app)


# Modelos de datos
class ClientService(db.Model):
    client_id = db.Column(db.Integer, db.ForeignKey('client.key_id'),
                          primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.key_id'),
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
    ubication_id = db.Column(db.Integer, db.ForeignKey('ubication.key_id'),
                             nullable=False)


class Payment(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    mount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Boolean, nullable=False)
    month = db.Column(db.Integer, db.ForeignKey(
        'month.key_id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey(
        'service.key_id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey(
        'client.key_id'), nullable=False)
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


# Rutas
@app.route('/dashboard/')
def dashboard():
    return render_template('dashboard.html')


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


@app.route('/system/payment/')
def payment():
    return render_template('payment.html')


@app.route('/system/orders/')
def orders():
    return render_template('orders.html')


# Prints
@app.route('/print/receipt/<int:id>/')
def receipt(id: int):
    client = Client.query.get(id)
    payment_list = request.args.getlist('pay')
    payments = list(map(lambda pay: Payment.query.get(pay), payment_list))

    receipt = {
        'name': client.name,
        'ubication': Ubication.query.get(client.ubication_id).name,
        'direction': client.direction,
        'payments': list(),
        'total': 0
    }

    for payment in payments:
        receipt['payments'].append({
            'month': Month.query.get(payment.month).name,
            'year': payment.year,
            'service': Service.query.get(payment.service_id).name,
            'status': payment.status,
            'mount': payment.mount
        })
        receipt['total'] = receipt['total'] + payment.mount

    return render_template('print_receipt.html', receipt=receipt)


@app.route('/print/orders')
def print_orders():
    get_payment_status = request.args.get('payment_status', type=str)
    get_village = request.args.get('ubication_id', type=int)
    clients = []
    if get_payment_status != '' and get_village != None:
        clients = Client.query.filter_by(payment_group=get_payment_status,
                                         ubication_id=get_village).all()

    elif get_payment_status != '' and get_village == None:
        clients = Client.query.filter_by(
            payment_group=get_payment_status).all()

    elif get_payment_status == '' and get_village != None:
        clients = Client.query.filter_by(ubication_id=get_village).all()

    elif get_payment_status == '' and get_village == None:
        clients = Client.query.all()

    data_clients = []

    for client in clients:
        obj_client = {
            'name': client.name,
            'direction': client.direction,
            'ubication': Ubication.query.get(client.ubication_id).name,
            'orders': {
                'parcial': list(),
                'standard': list(),
            },
            'total': 0
        }
        client_services = ClientService.query.filter_by(
            client_id=client.key_id).all()

        for client_service in client_services:
            service = Service.query.get(client_service.service_id)
            parcial_payments = Payment.query.filter_by(client_id=client.key_id,
                                                       service_id=service.key_id,
                                                       status=False).all()
            last_payment = Payment.query.filter_by(client_id=client.key_id,
                                                   service_id=service.key_id).order_by(Payment.year.desc()).order_by(Payment.month.desc()).first()

            if last_payment == None:
                continue

            for payment in parcial_payments:
                obj_client['orders']['parcial'].append({
                    'name': service.name,
                    'mount': client_service.price - payment.mount,
                    'month': Month.query.get(payment.month).name,
                    'year': payment.year
                })
                obj_client['total'] = obj_client['total'] + \
                    (client_service.price - payment.mount)

            first_month = last_payment.month + 1
            first_year = last_payment.year
            if first_month > 12:
                first_month = 1
                first_year = first_year + 1

            now_month = datetime.now().month
            now_year = datetime.now().year
            if service.status:
                now_month = now_month - 1
                if now_month < 1:
                    now_month = 12
                    now_year = now_year - 1

            if (now_year > first_year) or ((now_year == first_year) and (now_month >= first_month)):
                count = 0
                tmp_month = first_month
                tmp_year = first_year

                while (now_year > tmp_year) or ((now_year == tmp_year) and (now_month >= tmp_month)):
                    count = count + 1
                    tmp_month = tmp_month + 1
                    if tmp_month > 12:
                        tmp_month = 1
                        tmp_year = tmp_year + 1

                obj_client['orders']['standard'].append({
                    'name': service.name,
                    # 'price': client_service.price,
                    'first_payment': {
                        'month': Month.query.get(first_month).name,
                        'year': first_year
                    },
                    'new_payment': {
                        'month': Month.query.get(now_month).name,
                        'year': now_year
                    },
                    'count':  count,
                    'mount': count * client_service.price
                })
                obj_client['total'] = obj_client['total'] + \
                    count * client_service.price

        if (len(obj_client['orders']['standard']) != 0) or (len(obj_client['orders']['parcial']) != 0):
            data_clients.append(obj_client)

    return render_template('print_orders.html', data_clients=data_clients)


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
    ClientService.query.filter_by(client_id=id).delete()
    db.session.delete(client)
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


# Super API
@app.route('/api/v2/search/clients', methods=['GET'])
def search_clients():
    get_name = request.args.get('name', type=str)
    get_village = request.args.get('ubication_id', type=int)
    clients = []
    list_clients = []
    if get_name != None and get_village != None:
        search_name = "%{}%".format(get_name)
        clients = Client.query.filter(Client.name.like(search_name),
                                      Client.ubication_id == get_village).all()

    elif get_name != None and get_village == None:
        search_name = "%{}%".format(get_name)
        clients = Client.query.filter(Client.name.like(search_name)).all()

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
        Payment.year.desc()).order_by(Payment.month.desc()).order_by(Payment.service_id.desc()).all()
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
    client_service = ClientService.query.filter_by(service_id=service.key_id,
                                                   client_id=client.key_id).first()
    last_payment = Payment.query.filter_by(client_id=client.key_id,
                                           service_id=service.key_id).order_by(Payment.year.desc()).order_by(Payment.month.desc()).first()
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

            month = month + 1

            if month > 12:
                month = 1
                year = year + 1

            new_payment.month = month
            new_payment.year = year

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
                payment = Payment.query.filter_by(
                    client_id=client.key_id, service_id=service.key_id, month=month.key_id, year=year).first()
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


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
