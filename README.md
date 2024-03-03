# PoC Draw.io Enterprise Architect Integration https://github.com/jgraph/drawio/issues/1663
This project imports XMI files from Sparx System Enterprise Architect into Draw.io

* it loads an XMI exported from Sparx Systems Enterprise Architect
* it parses UML elements that are present in a data flow diagram, their geometry, source and target vertices for relationships
* it returns a structure with UML elements that can be easily represented as JSON
* it traverses the data structure with UML elements and dynamically creates mxgraph vertices and edges with the default style
* there is an HTML that displays the mxgraph (this HTML can be removed if it is not needed)
* finally, it outputs the mxgraph XML by logging it in the console

PoC scope
---------
This PoC is limited to a data flow diagram (DFD) for now.
It parses a Data Flow Diagram exported from EA as XMI and transforms it into an mxgraph XML for draw.io

The task requires an algorithm to:
* parse an XMI similar to the OMG XMI standard at https://www.omg.org/spec/XMI/2.5.1/PDF, but with proprietary XMI format extensions added by EA
* transform it into an mxgraph
* save the mxgraph as XML that can be opened with draw.io


PoC input (a data flow diagram exported from EA as XMI)
-------------------------------------------------------
https://pastebin.com/raw/udPsrsFC https://i.imgur.com/rOkUHyL.png

PoC output (a data flow diagram imported in draw.io)
----------------------------------------------------
A screenshot of the resulting mxgraph loaded with Draw.io: https://i.imgur.com/c5WOd5v.png

A screenshot of the program output: https://i.imgur.com/EePYoGm.png



Roadmap
-------
This program is good enough for my needs. Feel free to reuse it, fork it, modify it, etc. but please mention when your work will be inspired by Jack McKenzie's importer.

I will add support for 3 more diagram types:

* use case diagrams
* class diagrams
* component diagrams

Let me know. Like the post at https://github.com/jgraph/drawio/issues/1663 if you want this function for loading *.xmi from EA integrated into Draw.io. It can be a draw.io plugin that adds a new menu item, or it can be added in the core. I'd like to see your suggestions.
