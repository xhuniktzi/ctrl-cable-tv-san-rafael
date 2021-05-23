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
            'code': service.code,
            'status': service.status
        }


def unserialize_date(date):
    return datetime(int(date['year']),
                    int(date['month']) + 1, int(date['day']))


def serialize_date(date: datetime):
    if date is None:
        return {}
    else:
        return {'day': date.day, 'month': date.month, 'year': date.year}


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
            'ubication_id': client.ubication_id,
            'status': client.status
        }


def serialize_client_service(client_service):
    if client_service is None:
        return {}
    else:
        return {
            'client_id': client_service.client_id,
            'service_id': client_service.service_id,
            'price': client_service.price
        }


def serialize_payment(payment):
    if payment is None:
        return {}
    else:
        return {
            'id': payment.key_id,
            'mount': payment.mount,
            'status': bool(payment.status),
            'month': payment.month,
            'year': payment.year,
            'service_id': payment.service_id,
            'client_id': payment.client_id,
            'date': serialize_date(payment.datetime)
        }


def range_month_from_actual(month: int):
    month_prev_1 = month - 1
    if month_prev_1 <= 0:
        month_prev_1 = 12

    month_prev_2 = month_prev_1 - 1
    if month_prev_2 <= 0:
        month_prev_2 = 12

    month_prev_3 = month_prev_2 - 1
    if month_prev_3 <= 0:
        month_prev_3 = 12

    month_act = month

    month_next_1 = month + 1
    if month_next_1 > 12:
        month_next_1 = 1

    month_next_2 = month_next_1 + 1
    if month_next_2 > 12:
        month_next_2 = 1

    return {
        'prev_3': month_prev_3,
        'prev_2': month_prev_2,
        'prev_1': month_prev_1,
        'act': month_act,
        'next_1': month_next_1,
        'next_2': month_next_2
    }


def parse_range_month(range_month: dict):
    def get_month(month: int):
        if month == 1:
            return 'ENE'
        elif month == 2:
            return 'FEB'
        elif month == 3:
            return 'MAR'
        elif month == 4:
            return 'ABR'
        elif month == 5:
            return 'MAY'
        elif month == 6:
            return 'JUN'
        elif month == 7:
            return 'JUL'
        elif month == 8:
            return 'AGO'
        elif month == 9:
            return 'SEP'
        elif month == 10:
            return 'OCT'
        elif month == 11:
            return 'NOV'
        elif month == 12:
            return 'DIC'

    return {
        'prev_3': get_month(range_month['prev_3']),
        'prev_2': get_month(range_month['prev_2']),
        'prev_1': get_month(range_month['prev_1']),
        'act': get_month(range_month['act']),
        'next_1': get_month(range_month['next_1']),
        'next_2': get_month(range_month['next_2']),
    }