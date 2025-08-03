# kyle-personal-website
A website to host my resume and other cool projects.

If you would like to run this locally, see the steps below.

### How to use

First, in the `/backend` folder, set up a virtual env and install the requirements. 
```bash
source path/to/new/venv/bin/activate
pip install -r requirements.txt
```

In `/frontend` run `npm start`.  
In `/backend` run `uvicorn main:app --reload --port 5001 --log-level debug`.  

You should now be see the UI on `localhost:3000`.

If you install any new dependencies in the backend, run `pip freeze > requirements.txt` in `/backend`. Make sure you are in your virtual env when you do this.
