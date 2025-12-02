// 1. 로딩 화면 기능
window.addEventListener("load", () => {
    const loader = document.querySelector("#loader");
    // 1.5초 뒤에 로딩 화면 사라지게 함 (너무 빨리 사라지면 멋이 없으니까)
    setTimeout(() => {
        loader.classList.add("loader-hidden");
    }, 1000); // 1000ms = 1초
});
// 1. 요소 가져오기 (헤더, 사이드바 관련)
const navbar = document.querySelector('.navbar');
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');
const closeBtn = document.querySelector('.close-btn');
const overlay = document.querySelector('.overlay');
const scrollContainer = document.querySelector('.scroll-container'); 

// 2. 스크롤 이벤트 처리 (두 가지 경우 모두 대응)
function handleScroll(scrollTop) {
    if (scrollTop > 50) {
        navbar.classList.add('scrolled'); // 스크롤 내리면 흰색 배경
    } else {
        navbar.classList.remove('scrolled'); // 맨 위면 투명 배경
    }
}

if (scrollContainer) {
    // A. index.html 인 경우 (풀 페이지 스크롤 박스 감시)
    scrollContainer.addEventListener('scroll', () => {
        handleScroll(scrollContainer.scrollTop);
    });
} else {
    // B. recommend.html 인 경우 (일반 윈도우 스크롤 감시)
    window.addEventListener('scroll', () => {
        handleScroll(window.scrollY);
    });
}

// 3. 햄버거 버튼 클릭 -> 사이드바 열기
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
}

// 4. 닫기 기능 (X버튼 또는 배경 클릭 시)
const closeSidebar = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
};

if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
if (overlay) overlay.addEventListener('click', closeSidebar);


/* --- [추가 기능] 5. 스크롤 애니메이션 (Intersection Observer) --- */
const observerOptions = {
    threshold: 0.1 // 요소가 10% 정도 보이면 애니메이션 시작
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active'); // 화면에 들어오면 .active 추가
        }
    });
}, observerOptions);

// .reveal 클래스를 가진 모든 요소(카드들)를 감시
document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});


// ... (위쪽 코드는 그대로 둠) ...

/* --- [수정됨] 6. 카테고리 필터링 (+ 찜한 곳 모아보기 기능) --- */
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.cafe-card');

if (filterBtns) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. 버튼 활성화 스타일 변경
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                // 현재 카드의 하트 버튼 상태 확인
                const isLiked = card.querySelector('.heart-btn').classList.contains('active');

                let shouldShow = false;

                // 로직: 전체보기 vs 카테고리 vs 찜한곳
                if (filterValue === 'all') {
                    shouldShow = true;
                } else if (filterValue === 'liked') {
                    // ★ 찜한 곳 버튼을 눌렀을 때는 하트가 찍힌 것만 보여줌
                    if (isLiked) shouldShow = true;
                } else {
                    // 일반 카테고리 필터
                    if (cardCategory.includes(filterValue)) shouldShow = true;
                }

                // 보여주기 / 숨기기 처리
                if (shouldShow) {
                    card.classList.remove('hide');
                    setTimeout(() => card.classList.add('active'), 10); 
                } else {
                    card.classList.add('hide');
                    card.classList.remove('active');
                }
            });
        });
    });
}
/* --- [수정됨] 사이드바 멀티 드롭다운 기능 (카페리스트 + 인스타) --- */
// 모든 드롭다운 버튼을 다 찾아냅니다 (querySelectorAll)
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

if (dropdownToggles) {
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault(); // 링크 이동 막기

            // 클릭한 버튼 바로 다음에 있는 submenu를 찾음
            const submenu = toggle.nextElementSibling;

            if (submenu) {
                // 열고 닫기 (클래스 토글)
                submenu.classList.toggle('open');
                toggle.classList.toggle('active');
            }
        });
    });
}
/* --- [추가] 랜덤 추천 기능 --- */
const randomBtn = document.getElementById('randomBtn');
const randomModal = document.getElementById('randomModal');
const closeModal = document.querySelector('.close-modal');
const resultBox = document.querySelector('.random-result');
const goDetailBtn = document.querySelector('.btn-go-detail');

// 카페 데이터 (이름과 링크)
const cafeList = [
    { name: "코스모스에이피티", link: "cafe1-detail.html" },
    { name: "포도시커피", link: "cafe2-detail.html" },
    { name: "디드커피", link: "cafe3-detail.html" },
    { name: "팀버앤타임", link: "cafe4-detail.html" },
    { name: "바이아커피스토어", link: "cafe5-detail.html" },
    { name: "소프", link: "cafe6-detail.html" },
    { name: "현해탄", link: "cafe7-detail.html" },
    { name: "로스터리 펠릿", link: "cafe8-detail.html" },
    { name: "시화 커피 하우스", link: "cafe9-detail.html" }
];

if (randomBtn) {
    randomBtn.addEventListener('click', () => {
        randomModal.style.display = 'flex'; // 모달 열기
        goDetailBtn.style.display = 'none'; // 버튼 숨김
        resultBox.innerText = "추첨중...";
        
        let count = 0;
        // 0.1초마다 이름 바꾸기 효과 (두구두구두구)
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * cafeList.length);
            resultBox.innerText = cafeList[randomIndex].name;
            count++;
            
            // 20번 바뀌면 멈춤 (약 2초 뒤)
            if (count > 20) {
                clearInterval(interval);
                // 최종 결과 확정
                const finalPick = cafeList[Math.floor(Math.random() * cafeList.length)];
                resultBox.innerText = finalPick.name ;
                
                // 바로가기 버튼 설정
                goDetailBtn.style.display = 'inline-block';
                goDetailBtn.onclick = () => location.href = finalPick.link;
            }
        }, 100);
    });

    // 닫기 기능
    closeModal.addEventListener('click', () => randomModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == randomModal) randomModal.style.display = 'none';
    });
}
/* --- [추가] 찜하기(LocalStorage) 기능 --- */
const hearts = document.querySelectorAll('.heart-btn');

// 1. 저장된 찜 목록 불러오기 (없으면 빈 배열)
let likedCafes = JSON.parse(localStorage.getItem('likedCafes')) || [];

if (hearts) {
    hearts.forEach(heart => {
        // 현재 카드의 ID 찾기 (예: card-cosmos)
        const cardId = heart.parentElement.id;

        // 2. 이미 찜한 카페라면 빨간 하트로 표시
        if (likedCafes.includes(cardId)) {
            heart.classList.add('active');
        }

        // 3. 하트 클릭 이벤트
        heart.addEventListener('click', (e) => {
            e.preventDefault(); // 다른 동작 막기
            
            // 하트 모양 토글 (켜기/끄기)
            heart.classList.toggle('active');

            if (heart.classList.contains('active')) {
                // 찜 목록에 추가
                if (!likedCafes.includes(cardId)) {
                    likedCafes.push(cardId);
                }
            } else {
                // 찜 목록에서 삭제
                likedCafes = likedCafes.filter(id => id !== cardId);
            }

            // 4. 변경된 목록을 브라우저에 저장 (핵심!)
            localStorage.setItem('likedCafes', JSON.stringify(likedCafes));
        });
    });
}
/* =========================================================================
   [추가] 라이트박스 기능 (갤러리 확대보기)
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const galleryImages = document.querySelectorAll('.detail-image'); // 갤러리 썸네일들
    const lightboxModal = document.getElementById('imageLightbox'); // 라이트박스 배경
    const lightboxImage = document.getElementById('lightboxImage'); // 라이트박스 큰 이미지
    const closeBtn = document.querySelector('.lightbox-close'); // 닫기 버튼
    const prevBtn = document.querySelector('.lightbox-prev'); // 이전 버튼
    const nextBtn = document.querySelector('.lightbox-next'); // 다음 버튼

    let currentImageIndex = 0; // 현재 보고 있는 이미지의 순서

    // 1. 라이트박스 열기 함수
    const openLightbox = (index) => {
        currentImageIndex = index;
        // 클릭한 이미지의 src를 가져와서 큰 이미지에 적용
        lightboxImage.src = galleryImages[currentImageIndex].src;
        lightboxModal.classList.add('active'); // 모달 표시
        document.body.style.overflow = 'hidden'; // 배경 스크롤 막기
    };

    // 2. 라이트박스 닫기 함수
    const closeLightbox = () => {
        lightboxModal.classList.remove('active'); // 모달 숨김
        setTimeout(() => { lightboxImage.src = ''; }, 300); // 닫힌 후 src 초기화 (깜빡임 방지)
        document.body.style.overflow = 'auto'; // 배경 스크롤 다시 허용
    };

    // 3. 이미지 변경 함수 (이전/다음)
    const changeImage = (direction) => {
        currentImageIndex += direction;
        // 처음이나 끝에 도달하면 순환되도록 설정
        if (currentImageIndex < 0) {
            currentImageIndex = galleryImages.length - 1;
        } else if (currentImageIndex >= galleryImages.length) {
            currentImageIndex = 0;
        }
        // 새로운 인덱스의 이미지 주소로 변경
        lightboxImage.src = galleryImages[currentImageIndex].src;
    };

    // --- 이벤트 리스너 연결 ---

    // 갤러리 이미지 클릭 시 라이트박스 열기
    galleryImages.forEach((image, index) => {
        image.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    // 닫기 버튼 클릭 시
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    // 이전/다음 버튼 클릭 시
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 배경 클릭으로 전파되는 것 방지
        changeImage(-1);
    });
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeImage(1);
    });

    // 배경(검은 영역) 클릭 시 닫기
    if (lightboxModal) lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) { // 이미지나 버튼이 아닌 배경을 클릭했을 때만
            closeLightbox();
        }
    });

    // 키보드 이벤트 (ESC로 닫기, 화살표로 이동)
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return; // 라이트박스가 열려있을 때만 작동
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') changeImage(-1);
        if (e.key === 'ArrowRight') changeImage(1);
    });
});
/* =========================================================================
   [추가] 실시간 검색 기능 (엔터 필요 없이 치자마자 검색됨)
   ========================================================================= */
const searchInput = document.getElementById('searchInput');

if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        const searchVal = e.target.value.toLowerCase(); // 입력된 값 (소문자로 변환)
        
        // 1. 검색하면 필터 버튼 초기화 (전체 보기 상태로)
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (filterBtns) {
            filterBtns.forEach(b => b.classList.remove('active'));
            const allBtn = document.querySelector('[data-filter="all"]');
            if (allBtn) allBtn.classList.add('active');
        }

        // 2. 카드들 검사
        const cards = document.querySelectorAll('.cafe-card');
        cards.forEach(card => {
            const cafeName = card.querySelector('h2').innerText.toLowerCase(); // 카페 이름
            
            // 이름에 검색어가 포함되어 있으면 보여줌
            if (cafeName.includes(searchVal)) {
                card.classList.remove('hide');
            } else {
                card.classList.add('hide');
            }
        });
    });
}