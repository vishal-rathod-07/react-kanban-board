Kanban Board
============

A simple Kanban board application built with React that allows you to create and move tasks between columns.

Features
--------

*   Create new tasks with a name and column.
*   Move tasks between columns by dragging and dropping.
*   Three columns available: "To Do", "In Progress", and "Done".
*   Uses the `react-dnd` library for drag and drop functionality.
*   Tasks are stored in local storage, so they persist between refreshes
*   Delete tasks with a click of a button

Technologies used
-----------------

*   React
*   React DnD for drag and drop functionality
*   HTML5 backend for React DnD
*   CSS for styling

Usage
-----

1.  Clone the repository.
2.  Run `npm install` to install the necessary dependencies.
3.  Run `npm start` to start the development server.
4.  The app will be available at `http://localhost:3000` in your browser.

Customization
-------------

The app can be customized by editing the `KanbanBoard` component. The column names and the callbacks when task move can be changed.

Dependencies
------------

*   React
*   react-dnd
*   react-dnd-html5-backend

Contributing
------------

This project is open for contributions. If you would like to contribute, please create a pull request.
