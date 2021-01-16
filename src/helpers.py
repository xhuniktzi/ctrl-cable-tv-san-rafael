from flask import jsonify


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
