document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // Modal elements
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modalTitle");
  const eventTitleInput = document.getElementById("eventTitle");
  const startDateTimeInput = document.getElementById("startDateTime");
  const endDateTimeInput = document.getElementById("endDateTime");
  const saveBtn = document.getElementById("saveEventBtn");
  const deleteBtn = document.getElementById("deleteEventBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  let selectedDate = null;
  let selectedEvent = null;

  // Load saved events
  let myEvents = JSON.parse(localStorage.getItem("myEvents")) || [];

  // ✅ FullCalendar setup
  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "100%",
    events: myEvents,
    editable: true,

    dateClick: function (info) {
      selectedDate = info.dateStr;
      selectedEvent = null;

      modalTitle.textContent = "Add Event";
      eventTitleInput.value = "";

      // Pre-fill start date
      startDateTimeInput.value = info.dateStr + "T09:00"; // default 9 AM
      endDateTimeInput.value = "";

      deleteBtn.style.display = "none";
      openModal();
    },

    eventClick: function (info) {
      selectedEvent = info.event;

      modalTitle.textContent = "Edit Event";
      eventTitleInput.value = info.event.title;

      // Format dates for datetime-local input
      const formatDateTime = (d) => {
        if (!d) return "";
        const pad = (n) => (n < 10 ? "0" + n : n);
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      };

      startDateTimeInput.value = formatDateTime(info.event.start);
      endDateTimeInput.value = info.event.end
        ? formatDateTime(info.event.end)
        : "";

      deleteBtn.style.display = "inline-block";
      openModal();
    },
  });

  calendar.render();

  // ✅ Open modal
  function openModal() {
    modal.style.display = "flex";
    eventTitleInput.focus();
  }

  // ✅ Close modal
  function closeModal() {
    modal.style.display = "none";
    selectedDate = null;
    selectedEvent = null;
  }

  function generateId() {
    return "ev-" + Math.random().toString(36).substr(2, 9);
  }
  // ✅ Save or update event
  saveBtn.onclick = function () {
    const title = eventTitleInput.value.trim();
    const start = startDateTimeInput.value
      ? new Date(startDateTimeInput.value).toISOString()
      : null;
    const end = endDateTimeInput.value
      ? new Date(endDateTimeInput.value).toISOString()
      : null;

    if (!title || !start) {
      alert("Title and Start date are required!");
      return;
    }

    if (selectedEvent) {
      // Editing existing event
      const oldTitle = selectedEvent.title;

      selectedEvent.setProp("title", title);
      selectedEvent.setStart(start);
      selectedEvent.setEnd(end);

      myEvents = myEvents.map((ev) =>
        ev.id === selectedEvent.id
          ? { ...ev, title, start, end, id: ev.id }
          : ev
      );
    } else {
      // Adding new event
      const newEvent = { id: generateId(), title, start, end };
      myEvents.push(newEvent);
      calendar.addEvent(newEvent);
    }

    localStorage.setItem("myEvents", JSON.stringify(myEvents));
    closeModal();
  };

  // ✅ Delete event
  deleteBtn.onclick = function () {
    if (selectedEvent) {
      if (confirm("Delete this event?")) {
        selectedEvent.remove();
        myEvents = myEvents.filter(
          (ev) =>
            ev.id !== selectedEvent.id
        );
        localStorage.setItem("myEvents", JSON.stringify(myEvents));
        closeModal();
      }
    }
  };

  // ✅ Cancel button
  cancelBtn.onclick = closeModal;

  // ✅ Close modal if click outside content
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });
});
