import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Layout } from "lucide-react";

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

export function ResumeLayoutManager({ sections, onChange }: LayoutManagerProps) {
  // Initialize columns with default layout
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

  // Update columns when sections prop changes
  useEffect(() => {
    setColumns({
      main: {
        id: "main",
        title: "Main Content",
        sectionIds: sections.filter(s => !["skills", "interests", "languages", "awards", "publications"].includes(s))
      },
      sidebar: {
        id: "sidebar",
        title: "Sidebar Content",
        sectionIds: sections.filter(s => ["skills", "interests", "languages", "awards", "publications"].includes(s))
      }
    });
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

      const newColumn = {
        ...sourceColumn,
        sectionIds: newSectionIds,
      };

      const newColumns = {
        ...columns,
        [newColumn.id]: newColumn,
      };

      setColumns(newColumns);
      
      // Immediately update parent with new section order
      const newSections = [
        ...newColumns.main.sectionIds,
        ...newColumns.sidebar.sectionIds
      ];
      onChange(newSections);
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
        },
      };

      setColumns(newColumns);

      // Immediately update parent with new section order
      const newSections = [
        ...newColumns.main.sectionIds,
        ...newColumns.sidebar.sectionIds
      ];
      onChange(newSections);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Layout className="h-5 w-5 text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Layout Manager</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Drag and drop sections to reorganize your resume layout. The preview will update automatically.
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
