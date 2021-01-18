from flask import jsonify
from datetime import datetime


def serialize_village(village):
    if village is None:
        return {}
    else:
        return {
            'id': village.key_id,
            'name': village.name,
            'code': village.code
        }


def serialize_service(service):
    if service is None:
        return {}
    else:
        return {
            'id': service.key_id,
            'name': service.name,
            'code': service.code
        }


def unserialize_date(date):
    print(date)
    return datetime(int(date['year']), int(date['month']), int(date['day']))


def serialize_date(date: datetime):
    if date is None:
        return {}
    else:
        return {
            'day': date.day,
            'month': date.month,
            'year': date.year
        }


def serialize_client(client):
    if client is None:
        return {}
    else:
        return {
            'id': client.key_id,
            'name': client.name,
            'phone': client.phone,
            'direction': client.direction,
            'description': client.description,
            'payment_date': serialize_date(client.payment_date),
            'payment_group': client.payment_group,
            'internet_speed': client.internet_speed,
            'ip_address': client.ip_address,
            'router_number': client.router_number,
            'line_number': client.line_number,
            'ubication_id': client.ubication_id
        }
