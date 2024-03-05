# Draw.io Enterprise Architect Integration https://github.com/jgraph/drawio/issues/1663
This project imports XMI files from Sparx System Enterprise Architect into Draw.io

* It can be added in Draw.io as a plug-in.
* it loads an XMI exported from Sparx Systems Enterprise Architect
* it parses UML elements that are present in the diagram, their geometry, source and target vertices for relationships
* it returns a structure with UML elements that can be easily represented as JSON
* it traverses the data structure with UML elements and dynamically creates mxgraph vertices and edges with the default style

Installation
------------
- Enable external plug-ins in your draw.io desktop: https://github.com/jgraph/drawio-desktop/issues/1049
- Navigate to the Extras menu -> Plug-ins -> Add -> Select File -> OK -> select the file you downloaded, i.e. draw_io_ea_plugin.js
- Restart draw.io desktop.
- Navigate to the Extras menu -> Import XML from Sparx Systems EA...

![Draw.io plug-in](https://github.com/jmcklondonuk/drawio_enterprise_architect_integration/blob/main/drawio_plugin.png)


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
A screenshot from Draw.io: https://i.imgur.com/ihICND8.png


Future work
-----------
This plug-in is good enough for my needs. Feel free to reuse it, fork it, modify it, etc. but please mention when your code will be based on Jack McKenzie's EA plug-in.
