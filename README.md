# Draw.io Enterprise Architect Integration https://github.com/jgraph/drawio/issues/1663
This project imports XMI files from Sparx System Enterprise Architect into Draw.io

* It can added in Draw.io as a plug-in
* it loads an XMI exported from Sparx Systems Enterprise Architect
* it parses UML elements that are present in the diagram, their geometry, source and target vertices for relationships
* it returns a structure with UML elements that can be easily represented as JSON
* it traverses the data structure with UML elements and dynamically creates mxgraph vertices and edges with the default style

Scope
-----
* Data Flow Diagram (DFD)
* Use Case Diagram
* Component Diagram
* Class Diagram


Sample Input (a data flow diagram exported from EA as XMI)
----------------------------------------------------------
https://pastebin.com/fcyL8NFK https://i.imgur.com/mx9qkhn.png

Sample Output (a data flow diagram imported in draw.io)
-------------------------------------------------------
A screenshot of the resulting mxgraph loaded with Draw.io: https://i.imgur.com/ihICND8.png

A screenshot of the program output: https://i.imgur.com/z3dKhaq.png



Future work
-----------
This program is good enough for my needs. Feel free to reuse it, fork it, modify it, etc. but please mention when your work will be based on Jack McKenzie's importer.
