const destinations = [
  {
    id: 1,
    title: "Tokyo",
    country: "Japan",
    region: "Asia",
    estCost: "$150 / day",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "Paris",
    country: "France",
    region: "Europe",
    estCost: "$180 / day",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "Bali",
    country: "Indonesia",
    region: "Asia",
    estCost: "$70 / day",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "New York City",
    country: "United States",
    region: "Americas",
    estCost: "$220 / day",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "Rome",
    country: "Italy",
    region: "Europe",
    estCost: "$140 / day",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    title: "Rio de Janeiro",
    country: "Brazil",
    region: "Americas",
    estCost: "$95 / day",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80"
  }
];

const container = document.getElementById("destinationsContainer");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");

function displayDestinations(list) {
  if (list.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No destinations found.</p>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="card">
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="card-body">
        <h3>${item.title}</h3>
        <p class="location"><i class="fa-solid fa-location-dot"></i> ${item.country} (${item.region})</p>
        <div class="card-footer">
          <span>${item.estCost}</span>
          <button style="border:none; background:none; color:#0284c7; cursor:pointer; font-weight:600;">Details &rarr;</button>
        </div>
      </div>
    </div>
  `).join("");
}

displayDestinations(destinations);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.getAttribute("data-category");
    if (category === "all") {
      displayDestinations(destinations);
    } else {
      displayDestinations(destinations.filter(d => d.region === category));
    }
  });
});

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  const searchResults = destinations.filter(d => 
    d.title.toLowerCase().includes(query) ||
    d.country.toLowerCase().includes(query) ||
    d.region.toLowerCase().includes(query)
  );
  displayDestinations(searchResults);
});

document.getElementById("calcBtn").addEventListener("click", () => {
  const travelers = parseInt(document.getElementById("travelersCount").value) || 1;
  const days = parseInt(document.getElementById("tripDays").value) || 1;
  const dailyCost = parseFloat(document.getElementById("avgDailyCost").value) || 0;

  const total = travelers * days * dailyCost;
  document.getElementById("estimateResult").innerText = `Total Estimate: $${total.toLocaleString()}`;
});
