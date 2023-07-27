import os,json
from flask import Flask, request, jsonify, render_template
from datetime import datetime
import copy

app = Flask(__name__)

todos = []
completed_todos = []
deleted_todos = []

template_dir = os.path.abspath('static')
app = Flask(__name__, template_folder=template_dir)


@app.route('/')
def index():
    return render_template('index.html')

def format_datetime(item_datetime):
    item_datetime=datetime.strptime(item_datetime,'%Y-%m-%dT%H:%M:%S.%f')
    return item_datetime.strftime("%b %d, %Y")

# Route to serve the page displaying the deleted ToDo items
@app.route('/deleted-items')
def deleted_items_page():
    deleteList=copy.deepcopy(deleted_todos) #deep copy to avoid changing the deleted_todos
    for todo in deleteList:
        todo['deleted_at'] = format_datetime(todo['deleted_at'])
    return render_template('deleted_items.html', deleteList=deleteList)

# Route to serve the page displaying the completed ToDo items
@app.route('/completed-items')
def completed_items_page():
    completeList=copy.deepcopy(completed_todos) #deep copy to avoid changing the completed_todos
    for todo in completeList:
        todo['completed_at']=format_datetime(todo['completed_at'])
    return render_template('completed_items.html', completeList=completeList)


# Helper function to generate a unique ID for new ToDo items
def generate_id():
    if not todos:
        return 1
    return max(todo['id'] for todo in todos) + 1

# CRUD Operations
@app.route('/todos', methods=['GET', 'POST'])
def todos_list():
    if request.method == 'GET':
        return jsonify(todos)
    elif request.method == 'POST':
        todo = request.json
        todo['id'] = generate_id()  # Generate a unique ID for the new ToDo item
        todo['created_at'] = datetime.now().isoformat()
        todos.append(todo)
        return jsonify(todo), 201

@app.route('/todos/completed/<int:todo_id>', methods=['POST'])
def completedTask(todo_id):
    todo = next((t for t in todos if t['id'] == todo_id), None)
    if not todo:
        return jsonify({'message': 'Todo not found'}), 404
    if request.method == 'POST':
        todos.remove(todo)
        todo['completed_at'] = datetime.now().isoformat()
        completed_todos.append(todo)
        return jsonify({'message': 'Todo deleted successfully'}), 204

@app.route('/todos/<int:todo_id>', methods=['GET', 'PUT', 'DELETE'])
def manage_todo_item(todo_id):
    todo = next((t for t in todos if t['id'] == todo_id), None)
    if not todo:
        return jsonify({'message': 'Todo not found'}), 404

    if request.method == 'GET':
        return jsonify(todo)
    elif request.method == 'PUT':
        data = request.get_json()
        title = data.get('title', '').strip()
        if title:
            todo['title'] = title
            todo['updated_at'] = datetime.now().isoformat()
            return jsonify(todo)
        else:
            return jsonify({'message': 'Invalid data'}), 400
    elif request.method == 'DELETE':
        todos.remove(todo)
        todo['deleted_at'] = datetime.now().isoformat()
        deleted_todos.append(todo)
        return jsonify({'message': 'Todo deleted successfully'}), 204


if __name__ == '__main__':
    app.run(debug=True)
