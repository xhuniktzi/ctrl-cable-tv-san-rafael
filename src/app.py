from flask import Flask, render_template, request, redirect, url_for, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'my_secret_key'
db = SQLAlchemy(app)


# Modelos de datos
# param: lazy=True -> SELECT, lazy=False -> JOIN, in relation model
class ClientServices(db.Model):
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
    ubication_id = db.Column(db.Integer, db.ForeignKey('ubication.key_id'),
                             nullable=False)


class Payment(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    mount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Boolean, nullable=False)
    month = db.Column(db.String(3), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.key_id'),
                           nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('client.key_id'),
                          nullable=False)


class Service(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)


# Rutas
@app.route('/dashboard/')
def dashboard():
    return render_template('dashboard.html')


@app.route('/admin/clients/')
def client_admin():
    villages = Ubication.query.all()
    return render_template('client_admin.html', villages=villages)


@app.route('/admin/villages/')
def village_admin():
    return render_template('village_admin.html')


# Endpoints
@app.route('/admin/clients/create', methods=['POST'])
def create_client():
    new_client = Client()
    new_client.name = request.form['name']
    new_client.phone = request.form['phone']
    new_client.direction = request.form['direction']
    new_client.description = request.form['description']
    new_client.ubication_id = request.form['ubication']
    db.session.add(new_client)
    db.session.commit()
    return redirect(url_for('client_admin'))


@app.route('/admin/villages/create', methods=['POST'])
def create_village():
    new_village = Ubication()
    new_village.name = request.form['name'],
    new_village.code = request.form['code']
    db.session.add(new_village)
    db.session.commit()
    return redirect(url_for('village_admin'))


# TODO: Create an API read-only
@app.route('/api/v1/client/<id>')
# Recibe un id con el nombre del cliente
def get_client_api(id: int):
    client = Client.query.filter_by(key_id=id).first()
    if client is None:
        abort(404)
    client_ubication = Ubication.query.filter_by(
        key_id=client.ubication_id).first()
    res = {
        'id': client.key_id,
        'name': client.name,
        'phone': client.phone,
        'direction': client.direction,
        'description': client.description,
        'ubication': {
            'id': client_ubication.key_id,
            'name': client_ubication.name,
            'code': client_ubication.code}
    }
    return jsonify(res)


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
