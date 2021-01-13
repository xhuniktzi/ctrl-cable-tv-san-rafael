from flask import Flask
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

client_services = db.Table('client_services',
                           db.Column('client_id',
                                     db.Integer,
                                     db.ForeignKey('client.key_id'),
                                     primary_key=True),
                           db.Column('service_id',
                                     db.Integer,
                                     db.ForeignKey('service.key_id'),
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
    status = db.Column(db.Boolean, nullable=False)
    month = db.Column(db.String(3), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    service_id = db.Column(db.Integer,
                           db.ForeignKey('service.key_id'), nullable=False)
    client_id = db.Column(db.Integer,
                          db.ForeignKey('client.key_id'), nullable=False)
    pass


class Service(db.Model):
    key_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    pass


if __name__ == "__main__":
    db.create_all()
    app.run(debug=True)
    pass
