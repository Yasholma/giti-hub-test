/**
 * @returns string
 * @param {str} string to transform first letter to uppercase
 */
function ucfirst(str) {
  return str[0].toUpperCase() + str.slice(1, str.length);
}

/**
 * @returns github profile
 * @param (token) github token for a user
 * @param (count = 20) number of repos to fetch
 */
async function fetchProfile(token, count = 20) {
  try {
    const data = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
      {
        viewer {
          name
          bio
          avatarUrl
          login
          repositories(first: ${count}) {
            totalCount
            nodes {
              name
              description
              resourcePath
              updatedAt
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
      `,
      }),
    });
    const dataJson = await data.json();

    return { data: dataJson.data.viewer };
  } catch (error) {
    return { error };
  }
}

// Fields
const repoCount = document.querySelector(".repo-count");
const avartaTag = document.getElementById("avatar");
const uname = document.querySelector(".name");
const username = document.querySelector(".username");
const bio = document.querySelector(".bio");
const repositories = document.getElementById("repositories");
const preloader = document.getElementById("preloader");
const token = "9e014ced796eadbf4928af81b25616821fcfe3d6";
const stickySection = document.querySelector(".sticky-section");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

window.addEventListener("load", () => {
  window.addEventListener("scroll", (e) => {
    if (window.scrollY > 53) stickySection.classList.add("scrolled");
    else stickySection.classList.remove("scrolled");
  });

  fetchProfile(token).then(({ data, error }) => {
    if (error) {
      preloader.style.display = "none";
      alert("Error loading github data...");
      console.log(error);
      return;
    }

    if (data) {
      repoCount.innerHTML = data.repositories.totalCount;
      avartaTag.src = `${data.avatarUrl}`;
      uname.innerHTML = data.name;
      username.innerHTML = ucfirst(data.login);

      bio.innerHTML = data.bio;

      let output = "";
      data.repositories.nodes.forEach((repo) => {
        const date = new Date(repo.updatedAt);
        const day = date.getDate();
        const month = months[date.getMonth() + 1];

        return (output += `<div class="repository border-bottom">
          <h3 class="repo-name">
            <a href="https://github.com${repo.resourcePath}" target="_blank">${
          repo.name
        }</a>
          </h3>
          <p class="repo-desc">${repo.description ? repo.description : ""}</p>
          <div class="meta">
            <div class="repo-lang">
              <span class="color" style="background: ${
                !!repo.primaryLanguage ? repo.primaryLanguage.color : ""
              }"></span>
              ${!!repo.primaryLanguage ? repo.primaryLanguage.name : ""}
            </div>

            <div class="timestamp">Updated on ${day} ${month}</div>
          </div>
        </div>`);
      });

      repositories.innerHTML = output;
      preloader.style.display = "none";
    }
  });
});
