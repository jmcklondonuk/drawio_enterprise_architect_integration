Draw.loadPlugin(function(ui) {
    // Do no use in chromeless mode
    if (ui.editor.isChromelessView()) {
        return;
    }

    mxResources.parse('importFromEA=Import XML from Sparx Systems EA...');
    var menu = ui.menus.get('extras');
    if (menu != null) {
        var oldFunct = menu.funct;
        menu.funct = function(menu, parent) {
            oldFunct.apply(this, arguments);
            ui.menus.addMenuItem(menu, ['importFromEA'], parent);
        };
    }

    ui.actions.addAction('importFromEA', function() {
        // Creates a file input element
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xml';

        // Listens for file selection
        fileInput.addEventListener('change', function(event) {
            var file = event.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(event) {
                    var parsedUmlElements = parseUmlElements(event.target.result);

                    var graph = ui.editor ? ui.editor.graph : ui.graph;
                    var parent = graph.getDefaultParent();

                    // Adds cells to the model in a single step
                    var model = graph.getModel();
                    model.beginUpdate();

                    try {
                        createMxGraphCells(parsedUmlElements, graph, parent);
                    } finally {
                        // Updates the display
                        model.endUpdate();
                    }
                };
                reader.readAsText(file);
            }
        });

        // Triggers a click event to open the file dialog
        fileInput.click();
    });

    // Parses one UML element
    function parseUmlElement(xmlDoc, type) {
        var result = [];

        var umlElements = xmlDoc.getElementsByTagName('UML:' + type);
        for (var i = 0; i < umlElements.length; i++) {
            var umlElement = umlElements[i];
            var umlElementId = umlElement.getAttribute('xmi.id');
            var umlElementName = umlElement.getAttribute('name');
            if (umlElementName == 'EARootClass')
                continue;

            if (type == 'Dependency') {
                var supplier = umlElement.getAttribute('supplier');
                var client = umlElement.getAttribute('client');
                result.push({
                    id: umlElementId,
                    name: umlElementName,
                    type: type,
                    supplier: supplier,
                    client: client
                });
            } else if (type == 'Association') {
                var connections = umlElement.getElementsByTagName('UML:AssociationEnd');
                if (connections !== null && connections.length > 1) {
                    var source = connections[0];
                    var sourceVertex = source.getAttribute('type');

                    var target = connections[1];
                    var targetVertex = target.getAttribute('type');
                    result.push({
                        id: umlElementId,
                        name: umlElementName,
                        type: type,
                        source: sourceVertex,
                        target: targetVertex
                    });
                }
            } else {
                attributes = [];
                if (type == 'Class') {
                    var umlAttributes = umlElement.getElementsByTagName('UML:Attribute');
                    if (umlAttributes !== null && umlAttributes !== undefined) {
                        for (var j = 0; j < umlAttributes.length; j++) {
                            var umlAttribute = umlAttributes[j];
                            var umlTaggedValues = umlAttribute.getElementsByTagName('UML:TaggedValue');
                            var dataType = "";
                            if (umlTaggedValues !== undefined && umlTaggedValues !== null && umlTaggedValues.length > 0) {
                                for (var k = 0; k < umlTaggedValues.length; k++) {
                                    if (umlTaggedValues[k].getAttribute('tag') == 'type') {
                                        dataType = umlTaggedValues[k].getAttribute('value');
                                        break;
                                    }
                                }
                            }

                            var attributeString;
                            if (dataType != '') {
                                attributeString = umlAttributes[j].getAttribute('name') + ':' + dataType;
                            } else {
                                attributeString = umlAttributes[j].getAttribute('name');
                            }

                            attributes.push(attributeString);
                        }
                    }
                }

                // Checks if the stereotype element exists
                var stereotypeElement = umlElement.getElementsByTagName('UML:Stereotype');
                var stereotypeName = null;
                if (stereotypeElement !== null && stereotypeElement.length > 0) {
                    stereotypeName = stereotypeElement[0].getAttribute('name');
                    result.push({
                        id: umlElementId,
                        name: umlElementName,
                        type: type,
                        stereotype: stereotypeName,
                        attributes: attributes
                    });
                } else
                    result.push({
                        id: umlElementId,
                        name: umlElementName,
                        type: type,
                        attributes: attributes
                    });
            }
        }

        return result;
    }

    // Parses UML elements and their geometry
    function parseUmlElements(xmlString) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        var umlElements = [];
        var types = ['Class', 'ActionState', 'Dependency', 'Actor', 'UseCase', 'Component', 'Association'];
        for (var i in types) {
            umlElements = umlElements.concat(parseUmlElement(xmlDoc, types[i]));
        }

        // Creates a map for O(1) lookup
        var indexElementsById = {};
        umlElements.forEach(function(element) {
            indexElementsById[element.id] = element;
        });

        // Finds all UML diagram elements in the XML
        var elements = xmlDoc.getElementsByTagName('UML:DiagramElement');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var id = element.getAttribute('subject');
            var geometry = element.getAttribute('geometry');

            // Parses geometry information
            var geometryValues = geometry.split(';');
            var left, top, right, bottom, sx, sy, ex, ey;
            for (var j = 0; j < geometryValues.length; j++) {
                var pair = geometryValues[j].split('=');
                if (pair[0] == 'Left') {
                    left = parseFloat(pair[1]);
                } else if (pair[0] == 'Top') {
                    top = parseFloat(pair[1]);
                } else if (pair[0] === 'Right') {
                    right = parseFloat(pair[1]);
                } else if (pair[0] === 'Bottom') {
                    bottom = parseFloat(pair[1]);
                } else if (pair[0] == 'SX') {
                    sx = parseFloat(pair[1]);
                } else if (pair[0] == 'SY') {
                    sy = parseFloat(pair[1]);
                } else if (pair[0] == 'EX') {
                    ex = parseFloat(pair[1]);
                } else if (pair[0] == 'EY') {
                    ey = parseFloat(pair[1]);
                }
            }

            // Calculates the width and height of this UML element
            var width = right - left;
            var height = bottom - top;

            // Updates the element with geometry information
            var foundElement = indexElementsById[id];
            if (foundElement) {
                if (foundElement.type == 'Dependency') {
                    foundElement.geometry = {
                        sx: sx,
                        sy: sy,
                        ex: ex,
                        ey: ey
                    };
                } else {
                    foundElement.geometry = {
                        x: left,
                        y: top,
                        width: width,
                        height: height
                    };
                }
            }
        }

        return umlElements;
    }

    // Interprets a tree of umlElements and adds corresponding vertices and edges to mxGraph
    function createMxGraphCells(umlElements, graph, parent) {
        var fontSize = 10;
        for (var i = 0; i < umlElements.length; i++) {
            var item = umlElements[i];
            var cell;

            if (item.type == 'Class') {
                cell = graph.insertVertex(parent, item.id, item.name, item.geometry.x, item.geometry.y, item.geometry.width, item.geometry.height);
                if (item.stereotype === 'DFD_DataStore') {
                    cell.setStyle('html=1;dashed=0;whiteSpace=wrap;shape=partialRectangle;right=0;left=0;fontSize=' + fontSize);
                } else {
                    cell.setStyle('shape=mxgraph.dfd.externalEntity;fontSize=' + fontSize);
                }

                if (item.attributes.length > 0) {
                    // Creates a vertex that represents a UML class
                    cell.setStyle('swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;whiteSpace=wrap;html=1;');
                    // Adds UML class attributes
                    var y = 20;
                    for (var j = 0; j < item.attributes.length; j++) {
                        var attribute = item.attributes[j];
                        var attributeLabel = new mxCell(attribute, new mxGeometry(0, y, 120, 20), 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;whiteSpace=wrap;html=1;');
                        attributeLabel.vertex = true;
                        graph.addCell(attributeLabel, cell);
                        y += 20;
                    }

                    // UML class methods are not yet implemented
                }
            } else if (item.type == 'ActionState') {
                cell = graph.insertVertex(parent, item.id, item.name, item.geometry.x, item.geometry.y, item.geometry.width, item.geometry.height);
                cell.setStyle('shape=ellipse;fontSize=' + fontSize);
            } else if (item.type == 'Component') {
                cell = graph.insertVertex(parent, item.id, item.name, item.geometry.x, item.geometry.y, item.geometry.width, item.geometry.height);
                cell.setStyle('shape=module;align=left;spacingLeft=20;align=center;verticalAlign=top;whiteSpace=wrap;html=1;fontSize=' + fontSize);
            } else if (item.type == 'Dependency') { // directional relationship in a data flow diagram (DFD)
                var sourceVertex = graph.getModel().getCell(item.client);
                var targetVertex = graph.getModel().getCell(item.supplier);
                cell = graph.insertEdge(parent, item.id, item.name, sourceVertex, targetVertex);

                var entryDx = 0;
                var entryDy = 0;

                var source = sourceVertex.geometry;
                var target = targetVertex.geometry;

                var entryX, entryY, exitX, exitY;

                if (source.x === target.x) { // Source aligned horizontally with target
                    if (source.y < target.y) { // Source above target
                        entryX = 0.5;
                        entryY = 1;
                        exitX = 0.5;
                        exitY = 0;
                    } else { // Source below target
                        entryX = 0.5;
                        entryY = 0;
                        exitX = 0.5;
                        exitY = 1;
                    }
                } else if (source.y === target.y) { // Source aligned vertically with target
                    if (source.x < target.x) { // Source to the left of target
                        entryX = 1;
                        entryY = 0.5;
                        exitX = 0;
                        exitY = 0.5;
                    } else { // Source to the right of target
                        entryX = 0;
                        entryY = 0.5;
                        exitX = 1;
                        exitY = 0.5;
                    }
                } else { // Source and target not aligned
                    if (source.x < target.x) { // Source to the left of target
                        if (source.y < target.y) { // Source above and to the left of target
                            entryX = 0;
                            entryY = 0.5;
                            exitX = 0.5;
                            exitY = 1;
                        } else { // Source below and to the left of target
                            entryX = 0;
                            entryY = 0.5;
                            exitX = 0.5;
                            exitY = 0;
                        }
                    } else { // Source to the right of target
                        if (source.y < target.y) { // Source above and to the right of target
                            entryX = 0.5;
                            entryY = 0.5;
                            exitX = 0.5;
                            exitY = 1;
                        } else { // Source below and to the right of target
                            entryX = 0.5;
                            entryY = 0.5;
                            exitX = 0.5;
                            exitY = 0;
                        }
                    }
                }

                // Sets edge style to curved edges with control points in this data flow diagram
                cell.setStyle('endArrow=classic;html=1;curved=1;edgeStyle=entityRelationEdgeStyle;elbow=vertical;fontSize=' + fontSize + ';exitX=' + exitX + ';exitY=' + exitY + ';entryX=' + entryX + ';entryY=' + entryY + ';entryDx=' + entryDx + ';entryDy=' + entryDy + ';jettySize=auto;orthogonalLoop=1;jumpStyle=none;rounded=0;orthogonal=1;strokeColor=#000000;fillColor=none;');
            } else if (item.type == 'Actor') {
                cell = graph.insertVertex(parent, item.id, item.name, item.geometry.x, item.geometry.y, item.geometry.width, item.geometry.height);
                cell.setStyle('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;');
            } else if (item.type == 'UseCase') {
                cell = graph.insertVertex(parent, item.id, item.name, item.geometry.x, item.geometry.y, item.geometry.width, item.geometry.height);
                cell.setStyle('ellipse;whiteSpace=wrap;html=1;');
            } else if (item.type == 'Association') {
                var sourceVertex = graph.getModel().getCell(item.source);
                var targetVertex = graph.getModel().getCell(item.target);
                cell = graph.insertEdge(parent, item.id, item.name, sourceVertex, targetVertex);
                cell.setStyle('endArrow=none');
            }
        }
    }
});
