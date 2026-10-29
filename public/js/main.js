/* ============================================
   Connectly — Main JavaScript
   All frontend interactions in one file
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  ("use strict");

  // ===========================================
  // SHARED: MOBILE NAVIGATION TOGGLE
  // ===========================================

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      navToggle.classList.toggle("open");
    });

    var navAnchors = navLinks.querySelectorAll("a");
    for (var i = 0; i < navAnchors.length; i++) {
      navAnchors[i].addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
      });
    }
  }

  // ===========================================
  // SHARED: SHOW / HIDE PASSWORD (login + register)
  // ===========================================

  var togglePasswordBtns = document.querySelectorAll(".toggle-password");
  for (var i = 0; i < togglePasswordBtns.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var input = btn.parentElement.querySelector("input");
        if (!input) return;
        if (input.type === "password") {
          input.type = "text";
          btn.textContent = "Hide";
        } else {
          input.type = "password";
          btn.textContent = "Show";
        }
      });
    })(togglePasswordBtns[i]);
  }

  // Fallback for legacy single password toggle
  var legacyToggle = document.getElementById("togglePassword");
  var legacyPassword = document.getElementById("password");
  if (
    legacyToggle &&
    legacyPassword &&
    !legacyToggle.classList.contains("toggle-password")
  ) {
    legacyToggle.addEventListener("click", function () {
      if (legacyPassword.type === "password") {
        legacyPassword.type = "text";
        legacyToggle.textContent = "Hide";
      } else {
        legacyPassword.type = "password";
        legacyToggle.textContent = "Show";
      }
    });
  }

  // ===========================================
  // SHARED: FORM VALIDATION (login, register, contact)
  // ===========================================

  // --- Login form ---
  var loginForm = document.getElementById("loginForm");
  // if (loginForm) {
  //   loginForm.addEventListener("submit", function (e) {
  //     // e.preventDefault();
  //     var email = loginForm.querySelector("#email");
  //     var password = loginForm.querySelector("#password");
  //     var feedback = document.getElementById("formFeedback");

  //     if (!email.value.trim() || !password.value.trim()) {
  //       showFormFeedback(feedback, "Please fill in all fields.", "error");
  //       return;
  //     }

  //     showFormFeedback(
  //       feedback,
  //       "Login successful! Redirecting to your feed... (Frontend demo only — backend coming soon.)",
  //       "success",
  //     );
  //     setTimeout(function () {
  //       window.location.href = "feed.html";
  //     }, 1800);
  //   });
  // }

  // --- Register form ---
  var registerForm = document.getElementById("registerForm");
  // if (registerForm) {
  //   registerForm.addEventListener("submit", function (e) {
  //     e.preventDefault();
  //     var fullName = document.getElementById("fullName");
  //     var username = document.getElementById("username");
  //     var email = document.getElementById("email");
  //     var password = document.getElementById("password");
  //     var confirmPassword = document.getElementById("confirmPassword");
  //     var feedback = document.getElementById("formFeedback");

  //     if (
  //       !fullName.value.trim() ||
  //       !username.value.trim() ||
  //       !email.value.trim() ||
  //       !password.value.trim()
  //     ) {
  //       showFormFeedback(feedback, "Please fill in all fields.", "error");
  //       return;
  //     }

  //     if (password.value.length < 6) {
  //       showFormFeedback(
  //         feedback,
  //         "Password must be at least 6 characters long.",
  //         "error",
  //       );
  //       return;
  //     }

  //     if (password.value !== confirmPassword.value) {
  //       showFormFeedback(feedback, "Passwords do not match.", "error");
  //       return;
  //     }

  //     showFormFeedback(
  //       feedback,
  //       "Account created successfully! Redirecting to login... (Frontend demo only — backend coming soon.)",
  //       "success",
  //     );
  //     setTimeout(function () {
  //       window.location.href = "login.html";
  //     }, 1800);
  //   });
  // }

  // --- Contact form ---

  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var message = document.getElementById("message");
      var feedback = document.getElementById("formFeedback");

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        showFormFeedback(feedback, "Please fill in all fields.", "error");
        return;
      }

      showFormFeedback(
        feedback,
        "Your message has been sent! We'll get back to you soon. (Frontend demo only — backend coming soon.)",
        "success",
      );
      contactForm.reset();
    });
  }

  function showFormFeedback(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = "form-feedback visible " + type;
    setTimeout(function () {
      el.classList.remove("visible");
    }, 4000);
  }

  // ===========================================
  // FEED PAGE INTERACTIONS
  // ===========================================

  var composerTextarea = document.getElementById("composerTextarea");
  var composerPostBtn = document.getElementById("composerPostBtn");
  var composerFeedback = document.getElementById("composerFeedback");
  var composerAttachBtn = document.getElementById("composerAttachBtn");
  var composerAttached = document.getElementById("composerAttached");
  var composerRemoveAttach = document.getElementById("composerRemoveAttach");
  var feedPostsContainer = document.getElementById("feedPostsContainer");

  if (composerAttachBtn && composerAttached) {
    composerAttachBtn.addEventListener("click", function () {
      composerAttached.classList.add("visible");
    });
  }

  if (composerRemoveAttach) {
    composerRemoveAttach.addEventListener("click", function () {
      composerAttached.classList.remove("visible");
    });
  }

  if (composerPostBtn && composerTextarea) {
    composerPostBtn.addEventListener("click", function () {
      var text = composerTextarea.value.trim();

      if (text === "") {
        showComposerFeedback("Please write something before posting.", "error");
        return;
      }

      if (text.length > 500) {
        showComposerFeedback("Posts are limited to 500 characters.", "error");
        return;
      }

      var audienceSelect = document.getElementById("composerAudience");
      var audience = audienceSelect ? audienceSelect.value : "Public";
      var hasImage =
        composerAttached && composerAttached.classList.contains("visible");

      var newPost = createPostElement({
        author: "Jane Doe",
        username: "@janedoe",
        initials: "JD",
        avatarClass: "",
        time: "Just now",
        audience: audience,
        text: escapeHtml(text),
        hasImage: hasImage,
        likes: 0,
        comments: 0,
        shares: 0,
      });

      if (feedPostsContainer) {
        feedPostsContainer.insertBefore(newPost, feedPostsContainer.firstChild);
      }

      composerTextarea.value = "";
      if (composerAttached) {
        composerAttached.classList.remove("visible");
      }

      showComposerFeedback(
        "Your post has been shared successfully! (Frontend demo only.)",
        "success",
      );
    });
  }

  function showComposerFeedback(message, type) {
    if (!composerFeedback) return;
    composerFeedback.textContent = message;
    composerFeedback.className = "composer-feedback visible " + type;
    setTimeout(function () {
      composerFeedback.classList.remove("visible");
    }, 3000);
  }

  // --- Create a post DOM element ---
  function createPostElement(data) {
    var article = document.createElement("article");
    article.className = "post-card-full";

    var imageHtml = data.hasImage
      ? '<div class="post-image var-' +
        (Math.floor(Math.random() * 5) + 1) +
        '"><span class="post-image-icon">&#128247;</span></div>'
      : "";

    var imageAttachedHtml = data.hasImage
      ? '<span class="post-audience-tag"> &middot; &#128247; Photo</span>'
      : "";

    article.innerHTML =
      '<div class="post-header">' +
      '<div class="post-avatar ' +
      data.avatarClass +
      '">' +
      data.initials +
      "</div>" +
      '<div class="post-header-info">' +
      '<div class="post-header-row">' +
      '<a href="profile.html" class="post-author">' +
      data.author +
      "</a>" +
      '<span class="post-username">' +
      data.username +
      "</span>" +
      '<span class="post-audience-tag"> &middot; ' +
      data.audience +
      "</span>" +
      imageAttachedHtml +
      "</div>" +
      '<span class="post-time">' +
      data.time +
      "</span>" +
      "</div>" +
      '<button class="post-options-btn" type="button" aria-label="Post options">&#8943;</button>' +
      '<div class="post-options-menu">' +
      '<button type="button" class="opt-save">&#128190; Save post</button>' +
      '<button type="button" class="opt-copy">&#128279; Copy link</button>' +
      '<button type="button" class="opt-hide">&#128065; Hide post</button>' +
      '<div class="post-options-divider"></div>' +
      '<button type="button" class="opt-report danger">&#9873; Report post</button>' +
      "</div>" +
      "</div>" +
      '<div class="post-body"><p>' +
      data.text +
      "</p></div>" +
      imageHtml +
      '<div class="post-stats-row">' +
      '<div class="post-stats-likes">' +
      '<span class="post-like-icons">' +
      '<span class="post-like-icon heart">&#10084;</span>' +
      '<span class="post-like-icon thumbs">&#128077;</span>' +
      "</span>" +
      '<span class="like-count">' +
      data.likes +
      "</span>" +
      "</div>" +
      '<span class="comment-count-text">' +
      data.comments +
      " comments &middot; " +
      data.shares +
      " shares</span>" +
      "</div>" +
      '<div class="post-actions-bar">' +
      '<form method="POST" action="/post/' +
      encodeURIComponent(data._id) +
      '/like">' +
      '<button class="action-btn like-btn" type="submit">' +
      '<span class="action-icon">&#10084;</span> ' +
      "</button>" +
      "</form>" +
      '<button class="action-btn comment-btn" type="button">' +
      '<span class="action-icon">&#128172;</span> Comment' +
      "</button>" +
      '<button class="action-btn share-btn" type="button">' +
      '<span class="action-icon">&#128279;</span> Share' +
      "</button>" +
      '<form class="save-form" method="POST" action="/post/' +
      encodeURIComponent(data._id) +
      '/save">' +
      '<button class="action-btn save-btn" type="submit">' +
      '<span class="action-icon">&#128190;</span> Save' +
      "</button>" +
      "</form>" +
      "</div>" +
      '<div class="comments-section">' +
      '<div class="comment-list">' +
      '<div class="comment-empty">No comments yet. Be the first to comment!</div>' +
      "</div>" +
      '<form class="comment-form"  method="POST" action="/post/' +
      encodeURIComponent(data._id) +
      '/comment">' +
      '<div class="comment-avatar" style="background: linear-gradient(135deg, var(--primary), var(--accent));">' +
      data.initials +
      "</div>" +
      '<input type="text" class="comment-input" placeholder="Write a comment..." required />' +
      '<input type="hidden" name="returnTo" value="/feed">' +
      '<button type="submit" class="comment-submit">Post</button>' +
      "</form>" +
      "</div>";

    attachPostInteractions(article);
    return article;
  }

  // --- Attach interactions to a post element ---
  function attachPostInteractions(postEl) {
    // Like button
    var likeBtn = postEl.querySelector(".like-btn");
    var likeCountEl = postEl.querySelector(".like-count");

    if (likeBtn) {
      likeBtn.addEventListener("click", function () {
        var liked = likeBtn.classList.toggle("liked");
        var count = parseInt(likeCountEl.textContent, 10) || 0;
        likeCountEl.textContent = liked ? count + 1 : Math.max(0, count - 1);
        if (liked) {
          likeBtn.querySelector(".action-icon").textContent = "\u2764\uFE0F";
          likeBtn.lastChild.textContent = " Liked";
        } else {
          likeBtn.querySelector(".action-icon").textContent = "\u2764";
          likeBtn.lastChild.textContent = " Like";
        }
      });
    }

    // Comment toggle
    var commentBtn = postEl.querySelector(".comment-btn");
    var commentsSection = postEl.querySelector(".comments-section");

    if (commentBtn && commentsSection) {
      commentBtn.addEventListener("click", function () {
        commentsSection.classList.toggle("open");
        if (commentsSection.classList.contains("open")) {
          var input = commentsSection.querySelector(".comment-input");
          if (input) input.focus();
        }
      });
    }

    // Comment form submit
    var commentForm = postEl.querySelector(".comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = commentForm.querySelector(".comment-input");
        var text = input.value.trim();
        if (text === "") return;

        var commentList = postEl.querySelector(".comment-list");
        var emptyMsg = commentList.querySelector(".comment-empty");
        if (emptyMsg) emptyMsg.remove();

        var comment = document.createElement("div");
        comment.className = "comment-item";
        comment.innerHTML =
          '<div class="comment-avatar" style="background: linear-gradient(135deg, var(--primary), var(--accent));">JD</div>' +
          '<div class="comment-body">' +
          '<div class="comment-meta">' +
          '<span class="comment-author">Jane Doe</span>' +
          '<span class="comment-time">Just now</span>' +
          "</div>" +
          '<p class="comment-text">' +
          escapeHtml(text) +
          "</p>" +
          '<div class="comment-actions">' +
          '<button class="comment-action" type="button">Like</button>' +
          '<button class="comment-action" type="button">Reply</button>' +
          "</div>" +
          "</div>";

        commentList.appendChild(comment);
        input.value = "";

        var commentCountText = postEl.querySelector(".comment-count-text");
        if (commentCountText) {
          var parts = commentCountText.textContent.split(" comments");
          var num = parseInt(parts[0].trim(), 10) || 0;
          var sharesPart =
            commentCountText.textContent.split(" comments")[1] || "";
          commentCountText.textContent = num + 1 + " comments" + sharesPart;
        }
      });
    }

    // Share button
    var shareBtn = postEl.querySelector(".share-btn");
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        var countText = postEl.querySelector(".comment-count-text");
        if (countText) {
          var match = countText.textContent.match(/(\d+)\s*shares/);
          if (match) {
            var shares = parseInt(match[1], 10) + 1;
            countText.textContent = countText.textContent.replace(
              /(\d+)\s*shares/,
              shares + " shares",
            );
          }
        }
        shareBtn.style.color = "var(--success)";
        setTimeout(function () {
          shareBtn.style.color = "";
        }, 1200);
      });
    }

    // Save button
    var saveBtn = postEl.querySelector(".save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var saved = saveBtn.classList.toggle("saved");
        if (saved) {
          saveBtn.querySelector(".action-icon").textContent = "\u2B50";
          saveBtn.lastChild.textContent = " Saved";
        } else {
          saveBtn.querySelector(".action-icon").textContent = "\uD83D\uDCBE";
          saveBtn.lastChild.textContent = " Save";
        }
      });
    }

    // Post options menu
    var optionsBtn = postEl.querySelector(".post-options-btn");
    var optionsMenu = postEl.querySelector(".post-options-menu");

    if (optionsBtn && optionsMenu) {
      optionsBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var allMenus = document.querySelectorAll(".post-options-menu.open");
        for (var j = 0; j < allMenus.length; j++) {
          if (allMenus[j] !== optionsMenu) {
            allMenus[j].classList.remove("open");
          }
        }
        optionsMenu.classList.toggle("open");
      });

      var optSave = optionsMenu.querySelector(".opt-save");
      if (optSave) {
        optSave.addEventListener("click", function () {
          if (saveBtn) saveBtn.click();
          optionsMenu.classList.remove("open");
        });
      }

      var optCopy = optionsMenu.querySelector(".opt-copy");
      if (optCopy) {
        optCopy.addEventListener("click", function () {
          optionsMenu.classList.remove("open");
          showToast("Link copied to clipboard! (Frontend demo only.)");
        });
      }

      var optHide = optionsMenu.querySelector(".opt-hide");
      if (optHide) {
        optHide.addEventListener("click", function () {
          postEl.style.transition = "opacity 0.3s ease";
          postEl.style.opacity = "0";
          setTimeout(function () {
            postEl.style.display = "none";
          }, 300);
          optionsMenu.classList.remove("open");
          showToast("Post hidden from your feed. (Frontend demo only.)");
        });
      }

      var optReport = optionsMenu.querySelector(".opt-report");
      if (optReport) {
        optReport.addEventListener("click", function () {
          optionsMenu.classList.remove("open");
          showToast("Post has been reported. Thank you. (Frontend demo only.)");
        });
      }
    }
  }

  // --- Toast notification ---
  function showToast(message) {
    var toast = document.createElement("div");
    toast.style.cssText =
      "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);" +
      "background:#1e293b;color:#fff;padding:0.7rem 1.5rem;border-radius:999px;" +
      "font-size:0.85rem;font-weight:500;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.2);" +
      "animation:fadeInDown 0.3s ease;";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2500);
  }

  // --- Attach interactions to all existing posts on page load ---
  var existingPosts = document.querySelectorAll(".post-card-full");
  for (var i = 0; i < existingPosts.length; i++) {
    attachPostInteractions(existingPosts[i]);
  }

  // --- Close all post option menus when clicking outside ---
  document.addEventListener("click", function (e) {
    if (
      !e.target.closest(".post-options-btn") &&
      !e.target.closest(".post-options-menu")
    ) {
      var openMenus = document.querySelectorAll(".post-options-menu.open");
      for (var j = 0; j < openMenus.length; j++) {
        openMenus[j].classList.remove("open");
      }
    }
  });

  // --- Feed tabs ---
  var feedTabs = document.querySelectorAll(".feed-tab");
  for (var i = 0; i < feedTabs.length; i++) {
    feedTabs[i].addEventListener("click", function () {
      for (var j = 0; j < feedTabs.length; j++) {
        feedTabs[j].classList.remove("active");
      }
      this.classList.add("active");
    });
  }

  // --- Stories add button ---
  var storyAdd = document.querySelector(".story-add");
  if (storyAdd) {
    storyAdd.addEventListener("click", function () {
      showToast(
        "Story feature coming soon! Share a photo or status update. (Frontend demo only.)",
      );
    });
  }

  // --- Suggested friends: follow/unfollow toggle ---
  var suggestBtns = document.querySelectorAll(".suggest-btn");
  for (var i = 0; i < suggestBtns.length; i++) {
    suggestBtns[i].addEventListener("click", function () {
      if (this.classList.contains("added")) {
        this.classList.remove("added");
        this.textContent = "Follow";
      } else {
        this.classList.add("added");
        this.textContent = "Following";
      }
    });
  }

  // --- Load more posts ---
  var loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      var samplePosts = [
        {
          author: "Emma Wilson",
          username: "@emmawilson",
          initials: "EW",
          avatarClass: "post-avatar-5",
          time: "3 days ago",
          audience: "Public",
          text: "Started a new coding project today and I'm really excited about it. Sometimes the best way to learn is just by building something from scratch!",
          hasImage: true,
          likes: 45,
          comments: 12,
          shares: 3,
        },
        {
          author: "Carlos Mendez",
          username: "@carlosmendez",
          initials: "CM",
          avatarClass: "post-avatar-6",
          time: "4 days ago",
          audience: "Friends",
          text: "Just completed a 30-day fitness challenge! It wasn't easy but the discipline taught me so much about consistency. What challenges have you taken on recently?",
          hasImage: false,
          likes: 89,
          comments: 24,
          shares: 7,
        },
        {
          author: "Sophie Chen",
          username: "@sophiechen",
          initials: "SC",
          avatarClass: "post-avatar-3",
          time: "5 days ago",
          audience: "Public",
          text: "Attended an amazing tech conference this week. The energy was incredible and I met so many inspiring people. Grateful for communities that push you to grow.",
          hasImage: true,
          likes: 203,
          comments: 41,
          shares: 18,
        },
      ];

      var container = document.getElementById("feedPostsContainer");
      if (!container) return;

      for (var i = 0; i < samplePosts.length; i++) {
        var post = createPostElement(samplePosts[i]);
        container.appendChild(post);
      }

      loadMoreBtn.style.display = "none";

      var endMsg = document.createElement("div");
      endMsg.className = "feed-empty";
      endMsg.innerHTML =
        '<div class="feed-empty-icon">&#127881;</div>' +
        "<h3>You're all caught up!</h3>" +
        "<p>You've seen all the latest posts from your network. Check back later for more.</p>";
      container.appendChild(endMsg);
    });
  }

  // ===========================================
  // PROFILE PAGE INTERACTIONS
  // ===========================================

  // --- Profile tabs ---
  var profileTabs = document.querySelectorAll(".profile-tab");
  for (var i = 0; i < profileTabs.length; i++) {
    profileTabs[i].addEventListener("click", function () {
      for (var j = 0; j < profileTabs.length; j++) {
        profileTabs[j].classList.remove("active");
      }
      this.classList.add("active");

      var targetId = this.getAttribute("data-tab");
      var contents = document.querySelectorAll(".profile-tab-content");
      for (var k = 0; k < contents.length; k++) {
        if (contents[k].getAttribute("data-tab") === targetId) {
          contents[k].classList.add("active");
        } else {
          contents[k].classList.remove("active");
        }
      }
    });
  }

  // --- Profile follow button ---
  var profileFollowBtn = document.getElementById("profileFollowBtn");
  if (profileFollowBtn) {
    profileFollowBtn.addEventListener("click", function () {
      if (this.classList.contains("following")) {
        this.classList.remove("following");
        this.textContent = "Follow";
        this.classList.remove("btn-outline");
        this.classList.add("btn-primary");
      } else {
        this.classList.add("following");
        this.textContent = "Following";
        this.classList.remove("btn-primary");
        this.classList.add("btn-outline");
      }
    });
  }

  // --- Profile edit button ---
  var profileEditBtn = document.getElementById("profileEditBtn");
  if (profileEditBtn) {
    profileEditBtn.addEventListener("click", function () {
      showToast(
        "Profile editing will be available once the backend is set up. (Frontend demo only.)",
      );
    });
  }

  // ===========================================
  // DASHBOARD PAGE INTERACTIONS
  // ===========================================

  // --- Dashboard quick action: create post redirect ---
  var dashCreatePost = document.getElementById("dashCreatePost");
  if (dashCreatePost) {
    dashCreatePost.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "feed.html";
    });
  }

  // --- Dashboard: like and comment on recent posts ---
  var dashPosts = document.querySelectorAll(".dash-post-item");
  for (var i = 0; i < dashPosts.length; i++) {
    (function (post) {
      var likeBtn = post.querySelector(".like-btn");
      var likeCountEl = post.querySelector(".like-count");

      if (likeBtn) {
        likeBtn.addEventListener("click", function () {
          var liked = likeBtn.classList.toggle("liked");
          if (likeCountEl) {
            var count = parseInt(likeCountEl.textContent, 10) || 0;
            likeCountEl.textContent = liked
              ? count + 1
              : Math.max(0, count - 1);
          }
          var icon = likeBtn.querySelector(".action-icon");
          if (icon) {
            icon.textContent = liked ? "\u2764\uFE0F" : "\u2764";
          }
        });
      }

      var commentBtn = post.querySelector(".comment-btn");
      if (commentBtn) {
        commentBtn.addEventListener("click", function () {
          window.location.href = "feed.html";
        });
      }
    })(dashPosts[i]);
  }

  // --- Dashboard: friend suggestion follow toggle ---
  var dashSuggestBtns = document.querySelectorAll(".dash-suggest .suggest-btn");
  for (var i = 0; i < dashSuggestBtns.length; i++) {
    dashSuggestBtns[i].addEventListener("click", function () {
      if (this.classList.contains("added")) {
        this.classList.remove("added");
        this.textContent = "Follow";
      } else {
        this.classList.add("added");
        this.textContent = "Following";
      }
    });
  }

  // --- Dashboard: mark notifications as read ---
  var dashNotifs = document.querySelectorAll(".dash-notif");
  for (var i = 0; i < dashNotifs.length; i++) {
    dashNotifs[i].addEventListener("click", function () {
      this.classList.remove("unread");
      var dot = this.querySelector(".dash-notif-dot");
      if (dot) dot.style.display = "none";
    });
  }

  // --- Dashboard: animate chart bars on load ---
  var chartBars = document.querySelectorAll(".chart-bar");
  if (chartBars.length > 0) {
    for (var i = 0; i < chartBars.length; i++) {
      (function (bar, index) {
        var targetHeight = bar.getAttribute("data-height");
        bar.style.height = "0%";
        setTimeout(
          function () {
            bar.style.height = targetHeight + "%";
          },
          100 + index * 80,
        );
      })(chartBars[i], i);
    }
  }

  // --- Dashboard: animate stat counters ---
  var statValues = document.querySelectorAll("[data-count]");
  for (var i = 0; i < statValues.length; i++) {
    (function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var current = 0;
      var step = Math.max(1, Math.ceil(target / 30));
      var interval = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current.toLocaleString() + suffix;
      }, 30);
    })(statValues[i]);
  }

  // --- Dashboard: completion progress animate ---
  var completionFill = document.querySelector(".completion-fill");
  if (completionFill) {
    var targetWidth = completionFill.getAttribute("data-width");
    completionFill.style.width = "0%";
    setTimeout(function () {
      completionFill.style.width = targetWidth + "%";
    }, 200);
  }

  // ===========================================
  // SHARED UTILITIES
  // ===========================================

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Create Post Page ---
  var cpForm = document.getElementById("createPostForm");
  if (!cpForm) return;

  var cpText = document.getElementById("cpTextContent");
  var cpCharCount = document.getElementById("cpCharCount");
  var cpPhotoBtn = document.getElementById("cpPhotoBtn");
  var cpVideoBtn = document.getElementById("cpVideoBtn");
  var cpFeelingBtn = document.getElementById("cpFeelingBtn");
  var cpPhotoInput = document.getElementById("cpPhotoInput");
  var cpVideoInput = document.getElementById("cpVideoInput");
  var cpImagePreviews = document.getElementById("cpImagePreviews");
  var cpVideoPreviewWrap = document.getElementById("cpVideoPreviewWrap");
  var cpVideoPreview = document.getElementById("cpVideoPreview");
  var cpRemoveVideo = document.getElementById("cpRemoveVideo");
  var cpFeelingSection = document.getElementById("cpFeelingSection");
  var cpCloseFeeling = document.getElementById("cpCloseFeeling");
  var cpFeelingOptions = document.getElementById("cpFeelingOptions");
  var cpFeelingSelected = document.getElementById("cpFeelingSelected");
  var cpFeelingText = document.getElementById("cpFeelingText");
  var cpClearFeeling = document.getElementById("cpClearFeeling");
  var cpAudience = document.getElementById("cpAudience");
  var cpAudienceNote = document.getElementById("cpAudienceNote");
  var cpPublishBtn = document.getElementById("cpPublishBtn");
  var cpErrorBanner = document.getElementById("cpErrorBanner");
  var cpSuccessBanner = document.getElementById("cpSuccessBanner");

  var MAX_CHARS = 2000;
  var MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB per image
  var MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB per video
  var ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  var ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

  var selectedImages = [];
  var selectedVideo = null;
  var selectedFeeling = null;
  var isSubmitting = false;

  // Character counter
  function updateCharCount() {
    var len = cpText.value.length;
    cpCharCount.textContent = len;
    if (len >= MAX_CHARS) {
      cpCharCount.classList.add("over-limit");
    } else {
      cpCharCount.classList.remove("over-limit");
    }
  }
  cpText.addEventListener("input", updateCharCount);

  // Show error
  function showError(msg) {
    cpErrorBanner.textContent = msg;
    cpErrorBanner.classList.add("visible");
    cpSuccessBanner.classList.remove("visible");
  }

  function clearError() {
    cpErrorBanner.classList.remove("visible");
  }

  // Photo button triggers file input
  cpPhotoBtn.addEventListener("click", function () {
    cpPhotoInput.click();
  });

  // Video button triggers file input
  cpVideoBtn.addEventListener("click", function () {
    cpVideoInput.click();
  });

  // Feeling button toggles the feeling section
  cpFeelingBtn.addEventListener("click", function () {
    cpFeelingSection.style.display = "block";
    cpFeelingBtn.classList.add("active");
  });

  cpCloseFeeling.addEventListener("click", function () {
    cpFeelingSection.style.display = "none";
    cpFeelingBtn.classList.remove("active");
  });

  // Handle image selection
  cpPhotoInput.addEventListener("change", function () {
    clearError();
    var files = cpPhotoInput.files;
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileType = file.type.toLowerCase();
      if (ALLOWED_IMAGE_TYPES.indexOf(fileType) === -1) {
        showError(
          file.name +
            " is not a supported image format. Use JPG, PNG, or WebP.",
        );
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        showError(file.name + " is too large. Maximum image size is 10 MB.");
        continue;
      }
      selectedImages.push(file);
    }

    renderImagePreviews();
  });

  // Handle image selection

  // cpCreateForm.addEventListener("submit", async function (e) {
  //   e.preventDefault();

  //   clearError();

  //   const formData = new FormData(cpCreateForm);

  //   // Append the selected images stored in your array.
  //   selectedImages.forEach(function (file) {
  //     formData.append("media", file);
  //   });

  //   // Append the selected video, if present.
  //   if (selectedVideo) {
  //     formData.append("media", selectedVideo);
  //   }

  //   try {
  //     const response = await fetch(cpCreateForm.action, {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const result = await response.text();

  //     if (!response.ok) {
  //       throw new Error(result || "Failed to create post.");
  //     }
  //     renderImagePreviews()

  //     console.log("Post created:", result);
  //   } catch (error) {
  //     console.error("Error creating post:", error);
  //     showError(error.message || "Failed to create post.");
  //   }
  // });

  // Render image previews
  function renderImagePreviews() {
    cpImagePreviews.innerHTML = "";
    if (selectedImages.length === 0) {
      cpImagePreviews.style.display = "none";
      return;
    }
    cpImagePreviews.style.display = "grid";
    selectedImages.forEach(function (file, index) {
      var wrap = document.createElement("div");
      wrap.className = "cp-image-preview";

      var img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "cp-remove-btn";
      removeBtn.textContent = "\u00d7";
      removeBtn.addEventListener("click", function () {
        selectedImages.splice(index, 1);
        renderImagePreviews();
      });

      wrap.appendChild(img);
      wrap.appendChild(removeBtn);
      cpImagePreviews.appendChild(wrap);
    });
  }

  // Handle video selection
  cpVideoInput.addEventListener("change", function () {
    clearError();
    var file = cpVideoInput.files[0];
    if (!file) return;
    var fileType = file.type.toLowerCase();
    if (ALLOWED_VIDEO_TYPES.indexOf(fileType) === -1) {
      showError(
        file.name + " is not a supported video format. Use MP4 or WebM.",
      );
      cpVideoInput.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      showError(file.name + " is too large. Maximum video size is 50 MB.");
      cpVideoInput.value = "";
      return;
    }
    selectedVideo = file;
    cpVideoPreview.src = URL.createObjectURL(file);
    cpVideoPreviewWrap.style.display = "block";
    cpVideoBtn.classList.add("active");
  });

  // Remove video
  cpRemoveVideo.addEventListener("click", function () {
    selectedVideo = null;
    cpVideoPreview.src = "";
    cpVideoPreviewWrap.style.display = "none";
    cpVideoBtn.classList.remove("active");
    cpVideoInput.value = "";
  });

  // Feeling selection
  cpFeelingOptions.addEventListener("click", function (e) {
    var pill = e.target.closest(".cp-feeling-pill");
    if (!pill) return;
    var feeling = pill.getAttribute("data-feeling");

    // Clear previous selection
    var allPills = cpFeelingOptions.querySelectorAll(".cp-feeling-pill");
    allPills.forEach(function (p) {
      p.classList.remove("selected");
    });

    pill.classList.add("selected");
    selectedFeeling = feeling;
    cpFeelingText.textContent = feeling;
    cpFeelingSelected.style.display = "flex";
  });

  // Clear feeling
  cpClearFeeling.addEventListener("click", function () {
    selectedFeeling = null;
    cpFeelingSelected.style.display = "none";
    var allPills = cpFeelingOptions.querySelectorAll(".cp-feeling-pill");
    allPills.forEach(function (p) {
      p.classList.remove("selected");
    });
  });

  // Audience note
  cpAudience.addEventListener("change", function () {
    if (cpAudience.value !== "Public") {
      cpAudienceNote.style.display = "block";
    } else {
      cpAudienceNote.style.display = "none";
    }
  });

  // Form submit
  // cpForm.addEventListener("submit", function (e) {
  //   e.preventDefault();
  //   clearError();

  //   if (isSubmitting) return;

  //   // Validate: post cannot be completely empty
  //   var textContent = cpText.value.trim();
  //   var hasImages = selectedImages.length > 0;
  //   var hasVideo = selectedVideo !== null;
  //   var hasFeeling = selectedFeeling !== null;

  //   if (textContent === "" && !hasImages && !hasVideo && !hasFeeling) {
  //     showError(
  //       "Your post is empty. Write something, add a photo or video, or add a feeling before publishing.",
  //     );
  //     return;
  //   }

  //   // Disable button to prevent double submission
  //   isSubmitting = true;
  //   cpPublishBtn.disabled = true;
  //   cpPublishBtn.textContent = "Publishing...";

  //   // Simulate async submission (no backend in this demo)
  //   setTimeout(function () {
  //     cpSuccessBanner.classList.add("visible");

  //     // Redirect to feed after a short delay
  //     // setTimeout(function () {
  //     //   window.location.href = "";
  //     // }, 1200);
  //   }, 600);
  // });
});

/* =====================================================
   CONNECTLY — PREMIUM & PAYMENTS (JS ADDITIONS)
   Append this block to the end of your existing main.js,
   inside the DOMContentLoaded wrapper or at the bottom.
   It only runs on the payment pages and will not affect
   any existing Connectly functionality.
   ===================================================== */

(function () {
  "use strict";

  // ===========================================
  // CHECKOUT PAGE: prevent double submission
  // ===========================================
  var checkoutForm = document.getElementById("checkoutForm");
  var checkoutBtn = document.getElementById("checkoutSubmitBtn");

  if (checkoutForm && checkoutBtn) {
    var originalText = checkoutBtn.innerHTML;

    checkoutForm.addEventListener("submit", function () {
      // Only block re-submission; let the form POST normally.
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = "Redirecting to Paystack...";

      // If the redirect fails (server error handled by re-render),
      // allow a retry after a short delay.
      setTimeout(function () {
        if (checkoutBtn.disabled) {
          checkoutBtn.disabled = false;
          checkoutBtn.innerHTML = originalText;
        }
      }, 8000);
    });
  }

  // ===========================================
  // PAYMENT RESULT PAGE: subtle status animation
  // ===========================================
  var resultIcon = document.querySelector(".result-status-icon");
  if (resultIcon) {
    resultIcon.style.transform = "scale(0)";
    resultIcon.style.opacity = "0";
    resultIcon.style.transition =
      "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease";

    requestAnimationFrame(function () {
      setTimeout(function () {
        resultIcon.style.transform = "scale(1)";
        resultIcon.style.opacity = "1";
      }, 100);
    });
  }

  // ===========================================
  // PREMIUM PAGE: animate hero price on load
  // ===========================================
  var premiumPrice = document.querySelector(".premium-price-amount");
  if (premiumPrice) {
    var rawPrice = premiumPrice.textContent.replace(/[^\d]/g, "");
    var target = parseInt(rawPrice, 10);

    if (!isNaN(target) && target > 0) {
      var current = 0;
      // Step up quickly for a count-up effect
      var steps = 20;
      var increment = Math.ceil(target / steps);
      var suffix = premiumPrice.textContent.replace(/[\d,]/g, "");

      premiumPrice.textContent = "\u20A6" + "0" + suffix;

      var interval = setInterval(function () {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        premiumPrice.textContent = "\u20A6" + current.toLocaleString() + suffix;
      }, 30);
    }
  }

  // ===========================================
  // PAYMENT HISTORY: fade-in rows on load
  // ===========================================
  var historyRows = document.querySelectorAll(
    ".payment-history-table tbody tr",
  );
  for (var i = 0; i < historyRows.length; i++) {
    (function (row, index) {
      row.style.opacity = "0";
      row.style.transform = "translateY(10px)";
      row.style.transition = "opacity 0.3s ease, transform 0.3s ease";

      setTimeout(
        function () {
          row.style.opacity = "1";
          row.style.transform = "translateY(0)";
        },
        60 + index * 70,
      );
    })(historyRows[i], i);
  }

  // Mobile cards fade-in
  var historyCards = document.querySelectorAll(".payment-history-card");
  for (var j = 0; j < historyCards.length; j++) {
    (function (card, index) {
      card.style.opacity = "0";
      card.style.transform = "translateY(10px)";
      card.style.transition = "opacity 0.3s ease, transform 0.3s ease";

      setTimeout(
        function () {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        },
        60 + index * 70,
      );
    })(historyCards[j], j);
  }
})();

// ===========================================
// 404 PAGE — Search demo
// ===========================================

var notFoundSearchForm = document.getElementById("notFoundSearchForm");
if (notFoundSearchForm) {
  notFoundSearchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("notFoundSearch");
    var query = input.value.trim();
    if (query === "") {
      showToast("Type something to search! (Frontend demo only.)");
      return;
    }
    showToast(
      'Searching for "' +
        query +
        '"... (Frontend demo only — backend coming soon.)',
    );
  });
}

// ===========================================
// EDIT PROFILE PAGE
// ===========================================

var editProfileForm = document.getElementById("editProfileForm");

// --- Avatar image preview ---
var avatarInput = document.getElementById("avatarInput");
var avatarPreviewImg = document.getElementById("avatarPreviewImg");
var removeAvatarBtn = document.getElementById("removeAvatar");

if (avatarInput && avatarPreviewImg) {
  avatarInput.addEventListener("change", function () {
    var file = this.files && this.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        avatarPreviewImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

if (removeAvatarBtn && avatarPreviewImg) {
  removeAvatarBtn.addEventListener("click", function () {
    avatarPreviewImg.src =
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400";
    if (avatarInput) avatarInput.value = "";
  });
}

// --- Cover image preview ---
var coverInput = document.getElementById("coverInput");
var coverPreviewImg = document.getElementById("coverPreviewImg");
var removeCoverBtn = document.getElementById("removeCover");

if (coverInput && coverPreviewImg) {
  coverInput.addEventListener("change", function () {
    var file = this.files && this.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        coverPreviewImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

if (removeCoverBtn && coverPreviewImg) {
  removeCoverBtn.addEventListener("click", function () {
    coverPreviewImg.src =
      "https://images.pexels.com/photos/1597401/pexels-photo-1597401.jpeg?auto=compress&cs=tinysrgb&w=1200";
    if (coverInput) coverInput.value = "";
  });
}

// --- Bio character counter ---
var bioTextarea = document.getElementById("bio");
var bioCounter = document.getElementById("bioCounter");

if (bioTextarea && bioCounter) {
  var updateBioCounter = function () {
    var len = bioTextarea.value.length;
    bioCounter.textContent = len;
    var counterParent = bioCounter.parentElement;
    counterParent.classList.remove("warning", "danger");
    if (len >= 150) {
      counterParent.classList.add("danger");
    } else if (len >= 120) {
      counterParent.classList.add("warning");
    }
  };
  bioTextarea.addEventListener("input", updateBioCounter);
  updateBioCounter();
}

// --- Unsaved changes warning ---
if (editProfileForm) {
  var formChanged = false;

  editProfileForm.addEventListener("input", function () {
    formChanged = true;
  });

  editProfileForm.addEventListener("change", function () {
    formChanged = true;
  });

  editProfileForm.addEventListener("submit", function (e) {
    // e.preventDefault();
    formChanged = false;
  });

  var cancelEditBtn = document.getElementById("cancelEdit");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", function (e) {
      if (formChanged) {
        e.preventDefault();
        var confirmLeave = confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        );
        if (confirmLeave) {
          formChanged = false;
          window.location.href = "profile.html";
        }
      }
    });
  }

  window.addEventListener("beforeunload", function (e) {
    if (formChanged) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
}
