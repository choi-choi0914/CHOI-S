/* =========================================================================
   CHOI'S 2.0 INTEGRATED SCRIPT
   (Navbar, Sidebar, Filter, Carousel, Lightbox, Utils)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------------------
       1. 기본 기능 (헤더, 사이드바, 로딩)
       ------------------------------------------------------------------------- */
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.close-btn'); // 이름 변경 (충돌 방지)
    const overlay = document.querySelector('.overlay');
    const scrollContainer = document.querySelector('.scroll-container'); 

    // 로딩 화면 제거
    const loader = document.querySelector("#loader");
    if(loader) setTimeout(() => loader.classList.add("loader-hidden"), 1000);

    // 스크롤 이벤트
    function handleScroll(scrollTop) {
        if (scrollTop > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', () => handleScroll(scrollContainer.scrollTop));
    } else {
        window.addEventListener('scroll', () => handleScroll(window.scrollY));
    }

    // 사이드바 열기/닫기
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);
    if (sidebarClose) sidebarClose.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);

    // 사이드바 드롭다운
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = toggle.nextElementSibling;
            if (submenu) {
                submenu.classList.toggle('open');
                const arrow = toggle.querySelector('.arrow');
                if(arrow) arrow.textContent = submenu.classList.contains('open') ? '▲' : '▼';
            }
        });
    });


    /* -------------------------------------------------------------------------
       2. 필터 및 검색 기능 (recommend.html)
       ------------------------------------------------------------------------- */
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.cafe-card');

    function filterCards() {
        if (!cards.length) return;
        const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
        const activeBtn = document.querySelector('.filter-btn.active');
        const filterVal = activeBtn ? activeBtn.getAttribute('data-filter') : "all";

        cards.forEach(card => {
            const name = card.querySelector('h2').innerText.toLowerCase();
            const category = card.getAttribute('data-category');
            
            // 찜하기 상태 확인
            const heartBtn = card.querySelector('.heart-btn');
            const isLiked = heartBtn ? heartBtn.classList.contains('active') : false;

            let matchSearch = name.includes(searchVal);
            let matchFilter = (filterVal === 'all') || 
                              (filterVal === 'liked' && isLiked) || 
                              (category && category.includes(filterVal));

            if (matchSearch && matchFilter) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
    }

    if (searchInput) searchInput.addEventListener('keyup', filterCards);
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterCards();
            });
        });
    }

    // 찜하기 기능 (LocalStorage)
    const hearts = document.querySelectorAll('.heart-btn');
    let likedCafes = JSON.parse(localStorage.getItem('likedCafes')) || [];

    if (hearts.length > 0) {
        hearts.forEach(heart => {
            const cardId = heart.parentElement.id;
            if (likedCafes.includes(cardId)) heart.classList.add('active');

            heart.addEventListener('click', (e) => {
                e.preventDefault();
                heart.classList.toggle('active');
                if (heart.classList.contains('active')) {
                    if (!likedCafes.includes(cardId)) likedCafes.push(cardId);
                } else {
                    likedCafes = likedCafes.filter(id => id !== cardId);
                }
                localStorage.setItem('likedCafes', JSON.stringify(likedCafes));
                
                // 찜한 목록 필터 중이면 즉시 반영
                const activeBtn = document.querySelector('.filter-btn.active');
                if(activeBtn && activeBtn.getAttribute('data-filter') === 'liked') filterCards();
            });
        });
    }


    /* -------------------------------------------------------------------------
       3. 무한 롤링 슬라이드 (Special Page)
       ------------------------------------------------------------------------- */
    const carouselSlide = document.querySelector('.carousel-slide');
    if (carouselSlide) {
        let images = document.querySelectorAll('.carousel-slide img');
        const prevBtn = document.querySelector('#prevBtn');
        const nextBtn = document.querySelector('#nextBtn');

        let counter = 3; 
        const size = 3; 
        const gap = 20; 

        // 클론 생성
        for (let i = 0; i < size; i++) {
            const clone = images[images.length - 1 - i].cloneNode(true);
            clone.classList.add('clone');
            carouselSlide.prepend(clone);
        }
        for (let i = 0; i < size; i++) {
            const clone = images[i].cloneNode(true);
            clone.classList.add('clone');
            carouselSlide.append(clone);
        }

        const allImages = document.querySelectorAll('.carousel-slide img');

        function updateSlide(transition = true) {
            const slideWidth = allImages[0].offsetWidth + gap;
            carouselSlide.style.transition = transition ? "transform 0.4s ease-in-out" : "none";
            carouselSlide.style.transform = `translateX(${-counter * slideWidth}px)`;
        }

        window.addEventListener('load', () => updateSlide(false));
        window.addEventListener('resize', () => updateSlide(false));

        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (counter >= allImages.length - size) return;
            counter++;
            updateSlide();
        });

        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (counter <= 0) return;
            counter--;
            updateSlide();
        });

        carouselSlide.addEventListener('transitionend', () => {
            if (allImages[counter].classList.contains('clone')) {
                 if (counter >= allImages.length - size) counter = size;
                 else if (counter < size) counter = allImages.length - (size * 2);
                 updateSlide(false);
            }
        });
    }


    /* -------------------------------------------------------------------------
       4. [통합] 라이트박스 (기존 갤러리 + Masonry 사진첩 모두 지원)
       ------------------------------------------------------------------------- */
    const lightboxModal = document.getElementById('imageLightbox');
    
    // 라이트박스가 있는 페이지에서만 실행
    if (lightboxModal) {
        const lightboxImage = document.getElementById('lightboxImage');
        const lbClose = document.querySelector('.lightbox-close'); // 이름 변경
        const lbPrev = document.querySelector('.lightbox-prev');   // 이름 변경
        const lbNext = document.querySelector('.lightbox-next');   // 이름 변경
        
        // ★중요★ 모든 이미지 소스 선택 (.detail-image, .carousel-slide, .masonry-grid)
        // Masonry Grid 안의 이미지를 꼭 포함해야 함!
        let galleryImages = Array.from(document.querySelectorAll('.detail-image, .carousel-slide img:not(.clone), .masonry-grid .photo-item img'));
        let currentIndex = 0;

        const openLightbox = (index) => {
            currentIndex = index;
            lightboxImage.src = galleryImages[currentIndex].src;
            lightboxModal.style.display = 'flex'; // CSS flex로 띄움
            document.body.style.overflow = 'hidden'; // 스크롤 막기
        };

        const closeLightbox = () => {
            lightboxModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        // 이미지들에 클릭 이벤트 연결
        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                // 클릭된 이미지가 전체 리스트에서 몇 번째인지 확인
                // (동적으로 추가된 요소 고려하여 src로 찾기보다는 index로 직접 매핑이 안전할 수 있으나, 
                //  여기서는 querySelectorAll 순서대로 index가 매겨지므로 index 사용)
                openLightbox(index);
            });
        });

        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        
        // 배경 클릭 시 닫기
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });

        // 다음/이전 버튼
        const showNext = (e) => {
            if(e) e.stopPropagation();
            currentIndex = (currentIndex + 1) % galleryImages.length;
            lightboxImage.src = galleryImages[currentIndex].src;
        };

        const showPrev = (e) => {
            if(e) e.stopPropagation();
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            lightboxImage.src = galleryImages[currentIndex].src;
        };

        if (lbNext) lbNext.addEventListener('click', showNext);
        if (lbPrev) lbPrev.addEventListener('click', showPrev);

        // 키보드 제어
        document.addEventListener('keydown', (e) => {
            if (lightboxModal.style.display === 'flex') {
                if (e.key === 'ArrowRight') showNext();
                if (e.key === 'ArrowLeft') showPrev();
                if (e.key === 'Escape') closeLightbox();
            }
        });
    }


    /* -------------------------------------------------------------------------
       5. 기타 유틸리티 (랜덤, 공유, 커서, 스크롤 리빌)
       ------------------------------------------------------------------------- */
    
    // 랜덤 버튼
    const randomBtn = document.getElementById('randomBtn');
    const randomModal = document.getElementById('randomModal');
    if (randomBtn && randomModal) {
        const rClose = document.querySelector('.close-modal');
        const rResult = document.querySelector('.random-result');
        const rGoBtn = document.querySelector('.btn-go-detail');
        
        const cafeData = [
            { name: "코스모스", url: "cafe1-detail.html" },
            { name: "포도시", url: "cafe2-detail.html" },
            { name: "디드", url: "cafe3-detail.html" },
            { name: "팀버앤타임", url: "cafe4-detail.html" },
            { name: "바이아", url: "cafe5-detail.html" },
            { name: "소프", url: "cafe6-detail.html" },
            { name: "현해탄", url: "cafe7-detail.html" },
            { name: "펠릿", url: "cafe8-detail.html" },
            { name: "시화", url: "cafe9-detail.html" }
        ];

        randomBtn.addEventListener('click', () => {
            randomModal.style.display = 'flex';
            rGoBtn.style.display = 'none';
            rResult.innerText = "추첨중...";
            
            setTimeout(() => {
                const pick = cafeData[Math.floor(Math.random() * cafeData.length)];
                rResult.innerHTML = `오늘의 추천:<br><strong>${pick.name}</strong>`;
                rGoBtn.style.display = 'inline-block';
                rGoBtn.onclick = () => location.href = pick.url;
            }, 1000);
        });

        if(rClose) rClose.addEventListener('click', () => randomModal.style.display = 'none');
        randomModal.addEventListener('click', (e) => { if (e.target == randomModal) randomModal.style.display = 'none'; });
    }

    // 커스텀 커서
    const cursor = document.querySelector('.custom-cursor');
    if (cursor && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        const hoverTargets = document.querySelectorAll('a, button, .trip-card, .photo-item');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
            target.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
        });
    }

    // 스크롤 리빌 (Scroll Reveal)
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const targetElements = document.querySelectorAll('.main-intro, h2, p, .cafe-table, .trip-card, .btn-go-list, .atmosphere-section, .menu-box');
    targetElements.forEach((el) => {
        el.classList.add('reveal-on-scroll'); 
        revealObserver.observe(el);
    });

    // 공유하기 기능 전역 함수
    window.shareLink = function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            const toast = document.getElementById("toast");
            if(toast) {
                toast.classList.add("show");
                setTimeout(() => toast.classList.remove("show"), 3000);
            } else {
                alert("링크가 복사되었습니다!");
            }
        });
    };

}); // End DOMContentLoaded