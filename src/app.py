from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelos de datos

client_services = db.Table('client_services',
                           db.Column('service_id',
                                     db.Integer,
                                     primary_key=True),
                           db.Column('client_id',
                                     db.Integer,
                                     primary_key=True),
                           db.Column('price',
                                     db.Integer,
                                     nullable=False)
                           )


class Ubication(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    code_location = db.Column(db.String(5), nullable=False)
    clients = db.relationship('Client', backref="ubication")
    # param: lazy=True -> SELECT, lazy=False -> JOIN
    pass


class Client(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    ubication_id = db.Column(db.Integer,
                             db.ForeignKey('ubication.key_id'), nullable=False)
    payments = db.relationship('Payment', db.backref('client'))
    services = db.relationship('Service', secondary=client_services,
                               backref=db.backref('clients'))

    pass


class Payment(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    mount = db.Column(db.Integer, nullable=False)
    service_id = db.Column(db.Integer,
                           db.ForeignKey('service.key_id'), nullable=False)
    client_id = db.Column(db.Integer,
                          db.ForeignKey('client.key_id'), nullable=False)
    # True is OK, False is NOT OK
    # TODO: month & year
    status = db.Column(db.Boolean, nullable=False)
    pass


class Service(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    pass


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
    pass
