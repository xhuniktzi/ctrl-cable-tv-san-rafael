from wtforms import Form, StringField, PasswordField
from wtforms import validators


class RegisterForm(Form):
    username = StringField('username', validators=[
                           validators.Required()])
    password = PasswordField('password', validators=[
                             validators.Required()])


class LoginForm(Form):
    username = StringField('username', validators=[
                           validators.Required()])
    password = PasswordField('password', validators=[
                             validators.Required()])
