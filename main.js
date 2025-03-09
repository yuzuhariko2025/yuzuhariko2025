let currentResultIndex = 0;
let searchResults = [];

function initializeWelcomeOverlay() {
    const overlay = document.getElementById('welcomeOverlay');
    const closeBtn = document.getElementById('welcomeCloseBtn');

    // 3초 후에 닫기 버튼 표시
    setTimeout(() => {
        closeBtn.style.visibility = 'visible';
        closeBtn.style.opacity = '1';
    }, 1500);

    // 닫기 버튼 클릭 이벤트
    closeBtn.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        notification.style.opacity = '0';
    }, 1500);

    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

function searchSponsor() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();

    if (searchTerm === '') {
        showNotification('검색어를 입력해주세요.');
        return;
    }

    const tables = document.getElementsByClassName('sponsor-table');
    searchResults = [];
    currentResultIndex = 0;

    for (let t = 0; t < tables.length; t++) {
        const cells = tables[t].getElementsByTagName('td');

        for (let i = 0; i < cells.length; i++) {
            cells[i].classList.remove('highlight');
            const cellContent = cells[i].textContent.toLowerCase();
            if (cellContent.includes(searchTerm)) {
                searchResults.push(cells[i]);
            }
        }
    }

    if (searchResults.length > 0) {
        highlightResult(0);
        showResultNavigation();
    } else {
        showNotification('검색 결과가 없습니다.');
        hideResultNavigation();
    }
}

function highlightResult(index) {
    searchResults.forEach(cell => cell.classList.remove('highlight'));
    searchResults[index].classList.add('highlight');
    searchResults[index].scrollIntoView({behavior: 'smooth', block: 'center'});
    updateResultCount();
}

function showResultNavigation() {
    const nav = document.getElementById('resultNavigation');
    nav.style.display = 'block';
    updateResultCount();
}

function hideResultNavigation() {
    const nav = document.getElementById('resultNavigation');
    nav.style.display = 'none';
}

function updateResultCount() {
    const countSpan = document.getElementById('resultCount');
    countSpan.textContent = `${currentResultIndex + 1} / ${searchResults.length}`;
}

function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}

function setupIntersectionObserver() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    const images = document.querySelectorAll('.sponsor-image');
    images.forEach(img => observer.observe(img));
}

async function loadSponsors() {
    try {
        const response = await fetch('sponsors.json');
        const data = await response.json();
        const container = document.getElementById('sponsorContainer');

        data.groups.forEach((group, index) => {
            const section = document.createElement('div');
            section.className = 'sponsor-section';

            // 첫 그룹 슬라이더 적용
            if (index === 0) {
                const sliderContainer = document.createElement('div');
                sliderContainer.className = 'slider-container';

                const sliderWrapper = document.createElement('div');
                sliderWrapper.className = 'slider-wrapper';

                // 배열로 변경된 이미지 데이터로 슬라이드 생성
                const img1 = document.createElement('img');
                img1.src = group.image[0];
                img1.className = 'slide';

                const img2 = document.createElement('img');
                img2.src = group.image[1];
                img2.className = 'slide';

                sliderWrapper.appendChild(img1);
                sliderWrapper.appendChild(img2);

                const paginationDots = document.createElement('div');
                paginationDots.className = 'pagination-dots';
                paginationDots.innerHTML = `
                    <span class="dot active"></span>
                    <span class="dot"></span>
                `;

                sliderContainer.appendChild(sliderWrapper);
                sliderContainer.appendChild(paginationDots);
                section.appendChild(sliderContainer);

                // 슬라이더 기능 초기화
                initializeSlider(sliderWrapper);

            } else if (index > 0) {

                const imageDiv = document.createElement('div');
                imageDiv.className = 'sponsor-image';
                const img = document.createElement('img');
                img.src = group.image;  // 나머지 그룹은 단일 이미지
                img.alt = `사진 ${index + 1}`;
                img.className = 'cover-image';
                imageDiv.appendChild(img);
                section.appendChild(imageDiv);
            }

            // 첫 번째 그룹에만 검색 바 추가
            if (index === 0) {
                const searchContainer = document.createElement('div');
                searchContainer.className = 'search-container';
                searchContainer.innerHTML = `
                    <input type="text" id="searchInput" placeholder="닉네임으로 검색...">
                    <button id="searchButton">검색</button>
                `;
                section.appendChild(searchContainer);
            }

            const table = document.createElement('table');
            table.className = 'sponsor-table';

            for (let i = 0; i < group.sponsors.length; i += 3) {
                const row = table.insertRow();
                for (let j = 0; j < 3; j++) {
                    if (i + j < group.sponsors.length) {
                        const cell = row.insertCell();
                        cell.textContent = group.sponsors[i + j];
                    }
                }
            }

            section.appendChild(table);
            container.appendChild(section);
        });

        wrapNicknamesInSpan();
        setupIntersectionObserver();

        document.getElementById('searchButton').addEventListener('click', searchSponsor);
        document.getElementById('searchInput').addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchSponsor();
            }
        });
    } catch (error) {
        console.error('Error loading sponsors:', error);
    }
}

function wrapNicknamesInSpan() {
    const cells = document.querySelectorAll('.sponsor-table td');
    cells.forEach(cell => {
        const nickname = cell.textContent;
        cell.innerHTML = `<span class="nickname">${nickname}</span>`;
    });
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        topButton.style.opacity = "1";
    } else {
        topButton.style.opacity = "0";
    }
}

// 슬라이드
function initializeSlider(sliderWrapper) {
    const sliderContainer = sliderWrapper.parentElement;
    const dots = sliderContainer.querySelectorAll('.dot');
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let currentIndex = 0;
    let animationID;
    let autoSlideInterval;

    function updateDots() {
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            if (!isDragging) {
                currentIndex = currentIndex === 0 ? 1 : 0;
                currentTranslate = -currentIndex * 50;
                sliderWrapper.style.transform = `translateX(${currentTranslate}%)`;
                updateDots();
            }
        }, 5000);
    }

    function setSliderPosition() {
        sliderWrapper.style.transform = `translateX(${currentTranslate}%)`;
    }

    function animation() {
        if (isDragging) {
            setSliderPosition();
            requestAnimationFrame(animation);
        }
    }

    function touchStart(event) {
        startX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        isDragging = true;
        sliderWrapper.style.transition = 'none';
        if (autoSlideInterval) clearInterval(autoSlideInterval);

        if (animationID) {
            cancelAnimationFrame(animationID);
        }
        animationID = requestAnimationFrame(animation);
    }

    function touchMove(event) {
        if (!isDragging) return;

        const currentX = event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        const diff = (currentX - startX) / sliderWrapper.offsetWidth * 100;
        currentTranslate = prevTranslate + diff;

        // 바운스 효과 제한
        if (currentTranslate > 0) {
            currentTranslate = 0;
        } else if (currentTranslate < -50) {
            currentTranslate = -50;
        }
    }

    function touchEnd() {
        isDragging = false;
        const movedBy = currentTranslate - prevTranslate;

        sliderWrapper.style.transition = 'transform 0.3s ease-out';

        if (Math.abs(movedBy) > 10) {
            if (movedBy < 0) {
                currentIndex = 1;
                currentTranslate = -50;
            } else {
                currentIndex = 0;
                currentTranslate = 0;
            }
        } else {
            // 돌아가기
            currentTranslate = currentIndex === 0 ? 0 : -50;
        }

        setSliderPosition();
        updateDots();
        prevTranslate = currentTranslate;
        startAutoSlide();
    }

    // 터치 이벤트
    sliderWrapper.addEventListener('touchstart', touchStart);
    sliderWrapper.addEventListener('touchmove', touchMove);
    sliderWrapper.addEventListener('touchend', touchEnd);

    // 마우스 이벤트
    sliderWrapper.addEventListener('mousedown', touchStart);
    sliderWrapper.addEventListener('mousemove', touchMove);
    sliderWrapper.addEventListener('mouseup', touchEnd);
    sliderWrapper.addEventListener('mouseleave', touchEnd);

    // 페이지네이션 dots 클릭 이벤트
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            currentTranslate = -index * 50;
            sliderWrapper.style.transition = 'transform 0.3s ease-out';
            setSliderPosition();
            updateDots();
            prevTranslate = currentTranslate;
            startAutoSlide();
        });
    });

    // 초기 상태 설정
    updateDots();
    startAutoSlide();
}

// 이벤트 리스너 설정
function initializeEventListeners() {

    initializeWelcomeOverlay();

    // 이전 및 다음 결과 버튼 이벤트 리스너
    document.getElementById('prevResult').addEventListener('click', function() {
        if (searchResults.length > 0) {
            currentResultIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
            highlightResult(currentResultIndex);
        }
    });

    document.getElementById('nextResult').addEventListener('click', function() {
        if (searchResults.length > 0) {
            currentResultIndex = (currentResultIndex + 1) % searchResults.length;
            highlightResult(currentResultIndex);
        }
    });

    // 닫기 버튼 이벤트 리스너 추가
    document.getElementById('closeNavigation').addEventListener('click', function() {
        hideResultNavigation();
        // 하이라이트 제거
        searchResults.forEach(cell => cell.classList.remove('highlight'));
        searchResults = [];
        currentResultIndex = 0;
    });

    // Top 버튼 이벤트 리스너
    const topButton = document.getElementById("topButton");
    topButton.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', scrollFunction);

    // 페이지 로드 시 후원자 데이터 불러오기
    window.addEventListener('load', loadSponsors);
}

// 초기화 함수 실행
initializeEventListeners();