import { useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Layout, Save } from "lucide-react";

interface Column {
  id: string;
  title: string;
  sectionIds: string[];
}

interface LayoutManagerProps {
  sections: string[];
  onChange: (newSections: string[]) => void;
}

const SECTION_NAMES: { [key: string]: string } = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  interests: "Interests",
  languages: "Languages",
  awards: "Awards",
  publications: "Publications",
  volunteering: "Volunteering",
  references: "References"
};

// Define which sections belong in the sidebar
const SIDEBAR_SECTIONS = ["skills", "interests", "languages", "awards", "publications"];

export function ResumeLayoutManager({ sections, onChange }: LayoutManagerProps) {
  const [columns, setColumns] = useState<{ [key: string]: Column }>({
    main: {
      id: "main",
      title: "Main Content",
      sectionIds: []
    },
    sidebar: {
      id: "sidebar",
      title: "Sidebar Content",
      sectionIds: []
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Update columns whenever sections change
  useEffect(() => {
    if (!sections || sections.length === 0) return;

    const mainSections = sections.filter(s => !SIDEBAR_SECTIONS.includes(s));
    const sidebarSections = sections.filter(s => SIDEBAR_SECTIONS.includes(s));
    
    setColumns({
      main: {
        id: "main",
        title: "Main Content",
        sectionIds: mainSections
      },
      sidebar: {
        id: "sidebar",
        title: "Sidebar Content",
        sectionIds: sidebarSections
      }
    });
    
    setUnsavedChanges(false);
  }, [sections]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Same column and position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    if (sourceColumn === destColumn) {
      // Reordering within same column
      const newSectionIds = Array.from(sourceColumn.sectionIds);
      const [removed] = newSectionIds.splice(source.index, 1);
      newSectionIds.splice(destination.index, 0, removed);

      const newColumns = {
        ...columns,
        [sourceColumn.id]: {
          ...sourceColumn,
          sectionIds: newSectionIds,
        }
      };

      setColumns(newColumns);
      setUnsavedChanges(true);
    } else {
      // Moving between columns
      const sourceSectionIds = Array.from(sourceColumn.sectionIds);
      const destSectionIds = Array.from(destColumn.sectionIds);
      const [removed] = sourceSectionIds.splice(source.index, 1);
      destSectionIds.splice(destination.index, 0, removed);

      const newColumns = {
        ...columns,
        [sourceColumn.id]: {
          ...sourceColumn,
          sectionIds: sourceSectionIds,
        },
        [destColumn.id]: {
          ...destColumn,
          sectionIds: destSectionIds,
        }
      };

      setColumns(newColumns);
      setUnsavedChanges(true);
    }
  };

  const handleSaveLayout = () => {
    const newSections = [
      ...columns.main.sectionIds,
      ...columns.sidebar.sectionIds
    ];
    onChange(newSections);
    setUnsavedChanges(false);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Layout Manager</h3>
        </div>
        <button
          onClick={handleSaveLayout}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
            unsavedChanges 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          }`}
        >
          <Save className="h-4 w-4" />
          {unsavedChanges ? "Save Changes" : "Save Layout"}
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Drag and drop sections to reorganize your resume layout. The layout will be saved when you click the save button.
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 gap-6">
          {Object.values(columns).map(column => (
            <div key={column.id} className="space-y-3">
              <h4 className="font-medium text-sm text-foreground">
                {column.title}
              </h4>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[250px] p-3 border-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-dashed border-muted-foreground/25"
                    }`}
                  >
                    {column.sectionIds.map((sectionId, index) => (
                      <Draggable
                        key={sectionId}
                        draggableId={sectionId}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 bg-card border rounded-md shadow-sm transition-all flex items-center gap-3 group hover:border-primary/50 ${
                              snapshot.isDragging 
                                ? "shadow-lg border-primary" 
                                : "hover:shadow-md"
                            }`}
                            style={provided.draggableProps.style}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                            <span className="truncate font-medium text-foreground">
                              {SECTION_NAMES[sectionId] || sectionId}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
