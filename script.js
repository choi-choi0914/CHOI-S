// =========================================================================
//   1. 기본 기능 (헤더, 사이드바, 로딩)
// =========================================================================
const navbar = document.querySelector('.navbar');
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');
const closeBtn = document.querySelector('.close-btn');
const overlay = document.querySelector('.overlay');
const scrollContainer = document.querySelector('.scroll-container'); 

// 로딩 화면 제거
window.addEventListener("load", () => {
    const loader = document.querySelector("#loader");
    if(loader) setTimeout(() => loader.classList.add("loader-hidden"), 1000);
});

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
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
}
const closeSidebar = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
};
if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
if (overlay) overlay.addEventListener('click', closeSidebar);

// 사이드바 드롭다운
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
if (dropdownToggles) {
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const submenu = toggle.nextElementSibling;
            if (submenu) {
                submenu.classList.toggle('open');
                toggle.classList.toggle('active');
            }
        });
    });
}


// =========================================================================
//   2. 필터 및 검색 기능
// =========================================================================
// 스크롤 애니메이션
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, observerOptions);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 검색 및 필터
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.cafe-card');

function filterCards() {
    const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
    const activeBtn = document.querySelector('.filter-btn.active');
    const filterVal = activeBtn ? activeBtn.getAttribute('data-filter') : "all";

    cards.forEach(card => {
        const name = card.querySelector('h2').innerText.toLowerCase();
        const category = card.getAttribute('data-category');
        const isLiked = card.querySelector('.heart-btn') ? card.querySelector('.heart-btn').classList.contains('active') : false;

        let matchSearch = name.includes(searchVal);
        let matchFilter = (filterVal === 'all') || 
                          (filterVal === 'liked' && isLiked) || 
                          (category && category.includes(filterVal));

        if (matchSearch && matchFilter) {
            card.classList.remove('hide');
            setTimeout(() => card.classList.add('active'), 10);
        } else {
            card.classList.add('hide');
            card.classList.remove('active');
        }
    });
}

if (searchInput) searchInput.addEventListener('keyup', filterCards);
if (filterBtns) {
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
if (hearts) {
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
            
            // 찜한 목록 보고 있을 때 실시간 반영
            const activeBtn = document.querySelector('.filter-btn.active');
            if(activeBtn && activeBtn.getAttribute('data-filter') === 'liked') filterCards();
        });
    });
}


// =========================================================================
//   3. [수정됨] 무한 롤링 슬라이드 (Special Page)
// =========================================================================
if (document.querySelector('.carousel-container')) {
    const carouselSlide = document.querySelector('.carousel-slide');
    let images = document.querySelectorAll('.carousel-slide img');
    const prevBtn = document.querySelector('#prevBtn');
    const nextBtn = document.querySelector('#nextBtn');

    let counter = 3; // 앞쪽에 복사본 3개를 넣을 것이므로 시작 인덱스는 3
    const size = 3; // 한 번에 보여줄 이미지 개수
    const gap = 20; // CSS margin-right 값과 동일해야 함

    // 1. 무한 루프를 위해 앞뒤로 이미지 복사 (Cloning)
    // 마지막 3개 -> 맨 앞으로
    for (let i = 0; i < size; i++) {
        const clone = images[images.length - 1 - i].cloneNode(true);
        clone.classList.add('clone'); // 식별용
        carouselSlide.prepend(clone);
    }
    // 처음 3개 -> 맨 뒤로
    for (let i = 0; i < size; i++) {
        const clone = images[i].cloneNode(true);
        clone.classList.add('clone');
        carouselSlide.append(clone);
    }

    // 이미지 목록 다시 불러오기 (복사본 포함)
    const allImages = document.querySelectorAll('.carousel-slide img');

    // 너비 계산 및 이동 함수
    function updateSlide(transition = true) {
        const slideWidth = allImages[0].offsetWidth + gap;
        if (transition) {
            carouselSlide.style.transition = "transform 0.4s ease-in-out";
        } else {
            carouselSlide.style.transition = "none"; // 순간이동 할 때는 애니메이션 끄기
        }
        carouselSlide.style.transform = `translateX(${-counter * slideWidth}px)`;
    }

    // 초기 위치 잡기 (이미지 로드 후 실행)
    window.addEventListener('load', () => {
        updateSlide(false); // 애니메이션 없이 초기 위치로 이동
    });
    window.addEventListener('resize', () => updateSlide(false));

    // 다음 버튼
    nextBtn.addEventListener('click', () => {
        if (counter >= allImages.length - size) return;
        counter++;
        updateSlide();
    });

    // 이전 버튼
    prevBtn.addEventListener('click', () => {
        if (counter <= 0) return;
        counter--;
        updateSlide();
    });

    // 트랜지션이 끝났을 때 순간이동 (무한 루프 효과)
    carouselSlide.addEventListener('transitionend', () => {
        // 맨 끝 복사본에 도달하면 -> 진짜 처음으로 순간이동
        if (images[counter] && allImages[counter].classList.contains('clone')) {
             // 계산 로직: 전체 길이에서 클론 영역 조정
             if (counter >= allImages.length - size) {
                 counter = size; // 진짜 1번 이미지 위치
                 updateSlide(false);
             } 
             if (counter < size) {
                 counter = allImages.length - (size * 2); // 진짜 마지막 이미지 위치
                 updateSlide(false);
             }
        }
        // 간단한 인덱스 기반 리셋 (위 로직이 복잡할 경우 대비)
        if (counter >= allImages.length - size) {
            counter = size;
            updateSlide(false);
        }
        if (counter <= 0) {
            counter = allImages.length - (size * 2);
            updateSlide(false);
        }
    });
}


// =========================================================================
//   4. [수정됨] 라이트박스 (갤러리 + 슬라이드 모두 작동)
// =========================================================================
const lightboxModal = document.getElementById('imageLightbox');
if (lightboxModal) {
    const lightboxImage = document.getElementById('lightboxImage');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    // 상세 페이지 갤러리 + 슬라이드 이미지 모두 포함
    // .clone 제외 (슬라이드 복사본은 클릭 안 되게)
    let galleryImages = Array.from(document.querySelectorAll('.detail-image, .carousel-slide img:not(.clone)'));
    let currentIndex = 0;

    const openLightbox = (index) => {
        currentIndex = index;
        lightboxImage.src = galleryImages[currentIndex].src;
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    // 이미지 클릭 이벤트 연결
    // (슬라이드 이미지는 동적으로 위치가 바뀌므로 부모에게 위임하거나 다시 선택)
    // 여기서는 간단하게 전체 다시 선택해서 연결
    document.querySelectorAll('.detail-image, .carousel-slide img').forEach(img => {
        img.addEventListener('click', (e) => {
            // 클릭한 이미지가 원본 목록에서 몇 번째인지 찾기
            // src가 같은지 비교 (가장 확실한 방법)
            const targetIndex = galleryImages.findIndex(item => item.src === e.target.src);
            if (targetIndex !== -1) {
                openLightbox(targetIndex);
            }
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightboxModal) lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
    });

    // 라이트박스 내 화살표 이동
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryImages.length;
        lightboxImage.src = galleryImages[currentIndex].src;
    });
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImage.src = galleryImages[currentIndex].src;
    });
}


// =========================================================================
//   5. 기타 유틸리티 (랜덤, 공유)
// =========================================================================
const randomBtn = document.getElementById('randomBtn');
const randomModal = document.getElementById('randomModal');
if (randomBtn) {
    const rClose = document.querySelector('.close-modal');
    const rResult = document.querySelector('.random-result');
    const rGoBtn = document.querySelector('.btn-go-detail');
    
    // 카페 데이터
    const cafeData = [
        { name: "코스모스에이피티", url: "cafe1-detail.html" },
        { name: "포도시커피", url: "cafe2-detail.html" },
        { name: "디드커피", url: "cafe3-detail.html" },
        { name: "팀버앤타임", url: "cafe4-detail.html" },
        { name: "바이아커피스토어", url: "cafe5-detail.html" },
        { name: "소프", url: "cafe6-detail.html" },
        { name: "현해탄", url: "cafe7-detail.html" },
        { name: "로스터리 펠릿", url: "cafe8-detail.html" },
        { name: "시화 커피 하우스", url: "cafe9-detail.html" }
    ];

    randomBtn.addEventListener('click', () => {
        randomModal.style.display = 'flex';
        rGoBtn.style.display = 'none';
        rResult.innerText = "추첨중...";
        let count = 0;
        const interval = setInterval(() => {
            const pick = cafeData[Math.floor(Math.random() * cafeData.length)];
            rResult.innerText = pick.name;
            count++;
            if (count > 20) {
                clearInterval(interval);
                const final = cafeData[Math.floor(Math.random() * cafeData.length)];
                rResult.innerText = final.name;
                rGoBtn.style.display = 'inline-block';
                rGoBtn.onclick = () => location.href = final.url;
            }
        }, 100);
    });

    rClose.addEventListener('click', () => randomModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target == randomModal) randomModal.style.display = 'none'; });
}

function shareLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const toast = document.getElementById("toast");
        if(toast) {
            toast.className = "show";
            setTimeout(() => toast.className = toast.className.replace("show", ""), 3000);
        } else {
            alert("링크가 복사되었습니다!");
        }
    }).catch(() => alert("링크 복사 실패. URL을 직접 복사해주세요."));
}

/* =========================================================================
   [추가] 커스텀 마우스 커서 움직임
   ========================================================================= */
const cursor = document.querySelector('.custom-cursor');

if (cursor) {
    // 1. 마우스 움직임 추적
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // 2. 링크/버튼 위에 올렸을 때 효과 (커짐)
    // a 태그, button 태그, .card-link 클래스 등을 모두 찾음
    const hoverTargets = document.querySelectorAll('a, button, .card-link, .filter-btn, .fab-container, .trip-card');

    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        target.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });
}