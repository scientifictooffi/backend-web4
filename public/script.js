// document.addEventListener("DOMContentLoaded", function () {
//   var links = document.querySelectorAll("a");

//   var visitedLinks = JSON.parse(localStorage.getItem("visitedLinks")) || [];

//   links.forEach(function (link) {
//     link.addEventListener("click", function () {
//       visitedLinks.push(link.href);

//       visitedLinks = Array.from(new Set(visitedLinks));

//       localStorage.setItem("visitedLinks", JSON.stringify(visitedLinks));

//       updateVisitedLinks();
//     });
//   });

//   function updateVisitedLinks() {
//     var visitedLinksContainer = document.getElementById("visitedLinks");
//     visitedLinksContainer.innerHTML = "";

//     visitedLinks.forEach(function (visitedLink) {
//       var listItem = document.createElement("li");
//       listItem.textContent = visitedLink;
//       visitedLinksContainer.appendChild(listItem);
//     });
//   }

//   updateVisitedLinks();
// });

// app.get("/api/tours", async (req, res) => {
//   try {
//     const tours = await TourBooking.find().sort({ _id: -1 }); // Получаем все туры, сортированные по ID в обратном порядке
//     res.json(tours);
//   } catch (error) {
//     console.error("Error fetching tours:", error.message);
//     res.status(500).json({ error: `Internal Server Error: ${error.message}` });
//   }
// });
