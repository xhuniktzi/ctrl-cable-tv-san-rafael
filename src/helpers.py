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
