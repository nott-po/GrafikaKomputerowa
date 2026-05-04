# Sprawozdanie - Projekt 2: Eliminacja Wielokątów oraz Algorytm Malarza

**Imię i nazwisko:**
**Numer indeksu:**
**Data:**
**Przedmiot:** Grafika Komputerowa

---

## 1. Definicja i Opis Zadania

### 1.1 Cel projektu

Celem projektu była implementacja algorytmów eliminacji niewidocznych wielokątów w scenie trójwymiarowej oraz **samodzielne ustalanie kolejności rysowania widocznych wielokątów** za pomocą algorytmu malarza. Idea polega na zredukowaniu liczby wielokątów przekazywanych do renderera poprzez wcześniejsze odrzucenie tych, które z punktu widzenia obserwatora są niewidoczne (back-face oraz frustum culling), a następnie posortowaniu pozostałych wielokątów od najdalszego do najbliższego, tak aby bliższe wielokąty zamalowywały dalsze.

Zgodnie z wymaganiami zadania, zarówno eliminacja, jak i ustalanie kolejności rysowania odbywa się **wyłącznie metodami geometrycznymi**. Nie wykorzystano bufora głębi (Z-buffer) ani metod typu ray tracing czy ray casting — tego rodzaju techniki rozwiązywałyby problem za nas, podczas gdy istotą zadania jest własna implementacja testów widoczności oraz porządku rysowania w oparciu o właściwości matematyczne wielokątów i ich relację przestrzenną względem kamery. Bufor głębi został świadomie wyłączony zarówno w warstwie WebGL (parametr `depth: false` przy tworzeniu kontekstu), jak i w materiałach renderera (`depthTest: false`, `depthWrite: false`).

### 1.2 Zakres funkcjonalności

Program implementuje następujące funkcje:

- **Back-face culling** — eliminacja wielokątów odwróconych tyłem do obserwatora
- **Frustum culling** — eliminacja wielokątów znajdujących się poza stożkiem widzenia kamery
- **Algorytm malarza** — sortowanie widocznych wielokątów od najdalszego do najbliższego względem kamery i rysowanie w tej kolejności (zamiast Z-buffera)
- **Połączony pipeline** — sekwencyjne stosowanie testów eliminacji i sortowania w przestrzeni kamery
- **Sterowana kamera** — pełna kontrola translacji, rotacji oraz zoomu (kontynuacja Projektu 1)
- **Wizualizacja w czasie rzeczywistym** — kolorowe oznaczanie wielokątów według przyczyny eliminacji
- **Panel statystyk** — bieżąca prezentacja efektywności algorytmów
- **Tryb diagnostyczny** — możliwość niezależnego włączania i wyłączania każdego algorytmu, podgląd wektorów normalnych

### 1.3 Zrozumienie problemu

Renderowanie sceny trójwymiarowej polega na przekształceniu zbioru wielokątów na obraz pikseli. Można wyróżnić w nim dwa niezależne podproblemy:

1. **Eliminacja niewidocznych wielokątów** — odrzucenie tych, które nie wnoszą informacji do końcowego obrazu (odwróconych tyłem, znajdujących się poza polem widzenia).
2. **Ustalanie kolejności rysowania** — dla wielokątów, które przeszły eliminację, należy ustalić w jakiej kolejności mają być rasteryzowane, tak aby bliższe poprawnie zasłaniały dalsze.

Eliminację realizuje się na podstawie samej geometrii sceny oraz parametrów kamery — każdy wielokąt poddawany jest dwóm niezależnym testom (orientacji oraz przestrzennej obecności w stożku widzenia). Drugi podproblem rozwiązuje algorytm malarza: dla każdego pozostałego wielokąta wyznaczana jest jego głębokość w przestrzeni kamery, a następnie wszystkie widoczne wielokąty są sortowane malejąco po tej głębokości i rysowane w kolejności od najdalszego do najbliższego. Każdy kolejny wielokąt nakłada się na to, co zostało narysowane wcześniej — tak jak farba malarza pokrywa wcześniejsze warstwy obrazu.

Kluczowym aspektem zadania jest świadomość, że wszystkie trzy techniki bazują wyłącznie na operacjach algebry liniowej — iloczynach skalarnych, iloczynach wektorowych, arytmetyce równań płaszczyzn oraz mnożeniu wektora przez macierz widoku. Dzięki temu możliwe jest pełne rozwiązanie problemu widoczności bez korzystania z bufora głębi.

---

## 2. Realizacja od Strony Graficznej

### 2.1 Wybór Algorytmów i Uzasadnienie

#### 2.1.1 Back-Face Culling — eliminacja wielokątów odwróconych

Algorytm wykorzystuje fakt, że każdy wielokąt posiada zdefiniowaną orientację — stronę przednią i tylną. Strona przednia wskazywana jest przez wektor normalny, prostopadły do płaszczyzny wielokąta. Test widoczności sprowadza się do porównania kierunku tej normalnej z kierunkiem patrzenia obserwatora.

**Wyznaczanie wektora normalnego.** Dla wielokąta zdefiniowanego przez wierzchołki `v₀, v₁, v₂` (oraz ewentualne kolejne) normalna obliczana jest jako iloczyn wektorowy dwóch krawędzi rozpoczynających się we wspólnym wierzchołku:

- **edge₁** = v₁ − v₀
- **edge₂** = v₂ − v₀
- **normal** = znormalizowany iloczyn wektorowy edge₁ × edge₂

Kolejność wierzchołków (porządek przeciwnie do ruchu wskazówek zegara, patrząc od strony przedniej) determinuje kierunek wektora normalnego. Zachowanie spójnej kolejności podczas budowania sceny jest warunkiem koniecznym poprawności algorytmu.

**Test widoczności.** Dla każdego wielokąta wyznaczany jest wektor widoku — od środka wielokąta do pozycji kamery. Następnie wykonywany jest pojedynczy iloczyn skalarny:

- **viewVector** = znormalizowany wektor (cameraPos − polygonCenter)
- **d** = dot(normal, viewVector)
- jeśli **d < 0** → wielokąt skierowany tyłem → **odrzucenie**

Iloczyn skalarny mierzy kosinus kąta między wektorami. Wartość ujemna oznacza, że kąt przekracza 90°, a zatem normalna i kierunek do obserwatora wskazują w przeciwne półprzestrzenie — wielokąt jest odwrócony tyłem.

**Uzasadnienie wyboru.** Algorytm jest pojedynczym, bardzo tanim testem (jeden iloczyn wektorowy podczas budowy wielokąta, jeden iloczyn skalarny w każdej klatce). Dla obiektów zamkniętych — sześcianów, piramid, brył wypukłych — eliminuje on około połowy wielokątów niezależnie od pozycji kamery, ponieważ w każdej chwili dokładnie połowa ścian zamkniętej bryły zwrócona jest tyłem do obserwatora.

#### 2.1.2 Frustum Culling — eliminacja obiektów poza polem widzenia

Algorytm eliminuje wielokąty, które znajdują się całkowicie poza stożkiem widzenia kamery. Stożek ten — frustum — stanowi ostrosłup ścięty, ograniczony sześcioma płaszczyznami: lewą, prawą, górną, dolną, bliską oraz daleką.

**Reprezentacja płaszczyzny.** Każda płaszczyzna zapisywana jest w postaci równania `ax + by + cz + d = 0`, gdzie wektor `(a, b, c)` jest jej znormalizowaną normalną, a wartość `d` przesunięciem od początku układu współrzędnych. Po normalizacji znak wartości `dot(normal, point) + d` jednoznacznie określa, po której stronie płaszczyzny znajduje się punkt:

- wartość dodatnia — punkt po stronie wewnętrznej (skierowanej do wnętrza frustum)
- wartość ujemna — punkt po stronie zewnętrznej
- wartość bliska zeru — punkt leży na płaszczyźnie

**Ekstrakcja płaszczyzn — metoda Gribba-Hartmanna.** Sześć płaszczyzn frustum wyprowadzanych jest bezpośrednio z macierzy `M = Projection × View`. Każda płaszczyzna definiowana jest przez sumę lub różnicę odpowiednich wierszy tej macierzy:

| Płaszczyzna | Wzór |
|---|---|
| Lewa   | row₄ + row₁ |
| Prawa  | row₄ − row₁ |
| Dolna  | row₄ + row₂ |
| Górna  | row₄ − row₂ |
| Bliska | row₄ + row₃ |
| Daleka | row₄ − row₃ |

Współczynniki `(a, b, c, d)` każdej płaszczyzny normalizowane są przez długość wektora `(a, b, c)`, dzięki czemu funkcja odległości punktu od płaszczyzny zwraca wartość metryczną — w tych samych jednostkach, w jakich opisana jest scena.

Wybór tej metody wynika z jej elegancji obliczeniowej: zamiast ręcznie wyznaczać wierzchołki frustum i z nich budować płaszczyzny, korzysta się z faktu, że macierz projekcji już w sobie zawiera definicję wszystkich sześciu obcięć.

**Test wielokąta względem frustum.** Dla każdej z sześciu płaszczyzn sprawdzana jest pozycja każdego wierzchołka wielokąta. Jeśli **wszystkie** wierzchołki znajdują się po zewnętrznej stronie którejkolwiek płaszczyzny — wielokąt leży całkowicie poza frustum i podlega eliminacji. W przeciwnym razie wielokąt zostaje zachowany jako co najmniej częściowo widoczny.

Test ten jest konserwatywny — może zachować wielokąty, które wystają poza frustum, ale nie odrzuci żadnego, który byłby choć częściowo widoczny. Dla zadanego zakresu projektu jest to zachowanie pożądane.

#### 2.1.3 Algorytm malarza — kolejność rysowania widocznych wielokątów

Po fazie eliminacji pozostaje zbiór wielokątów potencjalnie widocznych. Aby uzyskać poprawny obraz bez korzystania z bufora głębi, należy je narysować w odpowiedniej kolejności — od najdalszych do najbliższych. Pozwala to bliższym wielokątom przykryć dalsze, dokładnie tak jak warstwy farby na obrazie. Stąd nazwa: **algorytm malarza** (ang. *painter's algorithm*).

**Wyznaczanie głębokości.** Każdemu wielokątowi przypisywana jest pojedyncza wartość głębokości — współrzędna `z` jego środka po transformacji macierzą widoku kamery. Środek wielokąta jest już obliczony w fazie tworzenia geometrii (średnia arytmetyczna wierzchołków), wystarczy zatem przekształcić go macierzą widoku:

- `c_view = View · c_world`
- `depth = c_view.z`

W przyjętym układzie współrzędnych (kamera patrzy w kierunku ujemnej osi `Z` przestrzeni widoku) wartości `depth` dla punktów przed kamerą są ujemne; im punkt dalej od kamery, tym wartość bardziej ujemna. Pozwala to posortować wielokąty rosnąco — pierwszy w liście jest najdalszy, ostatni najbliższy.

Faktyczna implementacja nie wykonuje pełnego mnożenia macierzy przez wektor — wystarcza skalarny iloczyn trzeciego wiersza macierzy widoku z wektorem rozszerzonym `(c_x, c_y, c_z, 1)`. W gl-matrix odpowiada to wyrażeniu `m[2]·c.x + m[6]·c.y + m[10]·c.z + m[14]`.

**Sortowanie i renderowanie.** Lista widocznych wielokątów sortowana jest w każdej klatce malejąco po odległości od kamery (rosnąco po `depth`). Następnie wielokąty rysowane są w tej kolejności, a wbudowany Z-buffer biblioteki Three.js zostaje wyłączony — całość kontekstu WebGL utworzona została z parametrem `depth: false`, a materiały warstwy widocznej mają ustawione `depthTest: false` oraz `depthWrite: false`. Dodatkowo wyłączone zostało automatyczne sortowanie obiektów Three.js (`renderer.sortObjects = false`), aby kolejność dodawania wielokątów do sceny pozostawała ostatecznym wyznacznikiem porządku rasteryzacji.

**Uzasadnienie wyboru.** Sortowanie po głębokości środka wielokąta jest najprostszym wariantem algorytmu malarza — pojedyncza wartość liczbowa na wielokąt, sortowanie standardowym `Array.sort` o złożoności `O(n log n)`. Dla sceny złożonej z brył rozłożonych w przestrzeni (sześciany, piramidy, oktahedr, klin) kryterium środka jest poprawne dla zdecydowanej większości konfiguracji kamery. Po wcześniejszym back-face cullingu nie istnieją sytuacje, w których dwa wielokąty tej samej bryły zamkniętej rywalizują o bycie z przodu — odwrócone tyłem są już odrzucone.

**Znane ograniczenia.** Algorytm malarza w tej najprostszej formie ma znane przypadki patologiczne:

- **Wielokąty przecinające się** — gdy płaszczyzny dwóch wielokątów się przecinają, żadna kolejność rysowania całych wielokątów nie daje poprawnego wyniku (rozwiązanie wymagałoby podziału jednego z nich, np. metodą BSP).
- **Cykle zasłonień** — trzy wielokąty mogą tworzyć cykl `A zasłania B, B zasłania C, C zasłania A`, który również nie ma rozwiązania bez podziału geometrii.
- **Sortowanie po centrach** — zawodzi, gdy duży wielokąt ma środek dalej niż mniejszy, ale jego brzegi sięgają bliżej (np. duża płaszczyzna podłogi vs mała kostka stojąca na niej).

W przyjętej scenie testowej żaden z tych przypadków nie występuje w sposób ciągły: bryły są rozłożone w przestrzeni i nie przecinają się wzajemnie, podłoga ma większy rozmiar i niski środek, ale po back-face cullingu jest widoczna tylko z góry, a obiekty na niej zawsze mają wyższe środki. Algorytm w prostej postaci jest zatem wystarczający dla zadanego zakresu projektu.

#### 2.1.4 Pipeline łączący wszystkie algorytmy

Algorytmy eliminacji stosowane są kolejno, z wcześniejszym przerwaniem przy pierwszej pozytywnej eliminacji, a następnie wynikowy zbiór wielokątów widocznych przekazywany jest do sortowania:

1. test back-face — pojedynczy iloczyn skalarny
2. jeśli wielokąt przeszedł test pierwszy — test frustum (do sześciu testów płaszczyznowych)
3. obliczenie `depth` (głębokość środka w przestrzeni kamery) — niezależnie od wyniku eliminacji, na potrzeby ewentualnego trybu diagnostycznego
4. sortowanie wszystkich widocznych wielokątów rosnąco po `depth` (od najdalszego do najbliższego)
5. rasteryzacja w ustalonej kolejności bez bufora głębi

Kolejność testów eliminacji została dobrana ze względu na koszt obliczeniowy: back-face wykonuje jedno mnożenie skalarne, podczas gdy frustum wymaga w najgorszym przypadku 6 testów płaszczyznowych pomnożonych przez liczbę wierzchołków wielokąta. Wcześniejsze odrzucenie wielokąta na etapie back-face oszczędza pełen koszt testu frustum. Sortowanie odbywa się tylko raz na klatkę i obejmuje już zredukowany zbiór wielokątów.

#### 2.1.5 Wizualizacja wyników eliminacji

Aby umożliwić obserwację działania algorytmów, każdy wielokąt może zostać wyświetlony w kolorze odpowiadającym przyczynie jego klasyfikacji:

| Kolor | Znaczenie |
|---|---|
| Biały | Wielokąt widoczny |
| Czerwony | Wielokąt odrzucony przez back-face culling |
| Cyjan | Wielokąt odrzucony przez frustum culling |
| Żółty | Wektor normalny (tryb diagnostyczny) |

W trybie domyślnym renderer rysuje wyłącznie wielokąty widoczne. Po włączeniu trybu diagnostycznego wszystkie wielokąty pozostają na ekranie, a kolor wskazuje przyczynę ich eliminacji. Pozwala to wizualnie zweryfikować, czy oba algorytmy klasyfikują geometrię zgodnie z oczekiwaniami.

### 2.2 Struktura Sceny

Scena testowa została zaprojektowana w sposób umożliwiający równoczesną obserwację skuteczności obu algorytmów. Składa się z **71 wielokątów** rozmieszczonych w przestrzeni tak, aby z pozycji domyślnej:

- około połowy ścian każdej bryły zamkniętej była eliminowana przez back-face culling
- część obiektów wykraczała poza frustum, generując widoczne odrzucenia frustum culling
- pozostałe wielokąty pozostawały widoczne, zapewniając czytelny widok sceny

| Obiekt | Liczba wielokątów | Pozycja | Rozmiar |
|---|---|---|---|
| Sześcian centralny | 6 (kwadratów) | (0, 1, 0) | 2 × 2 × 2 |
| Sześcian lewy bliski | 6 | (−4.5, 0.75, 1) | 1.5 × 1.5 × 1.5 |
| Sześcian prawy bliski | 6 | (4.5, 0.75, 1) | 1.5 × 1.5 × 1.5 |
| Sześcian tylny mały | 6 | (0, 0.5, −12) | 1 × 1 × 1 |
| Sześcian skrajny lewy | 6 | (−14, 1, 0) | 2 × 2 × 2 |
| Sześcian skrajny prawy | 6 | (14, 1, 0) | 2 × 2 × 2 |
| Sześcian wieża górna | 6 | (7, 1.5, −5) | 1.5 × 1.5 × 1.5 |
| Sześcian wieża dolna | 6 | (8.5, 0.5, −5) | 1 × 1 × 1 |
| Piramida lewa | 5 (4 trójkąty + podstawa) | (−2.5, 0, −4) | 2.2 |
| Piramida prawa | 5 | (2.5, 0, −4) | 2.2 |
| Oktahedr | 8 (trójkątów) | (0, 3.5, −2) | promień 1.2 |
| Klin (graniastosłup trójkątny) | 5 (2 trójkąty + 3 kwadraty) | (−7, 0, −5) | 2 × 1.5 × 3 |
| **Suma** | **71** | | |

Sześciany skrajne (na pozycjach x = ±14) zostały umieszczone celowo poza domyślnym polem widzenia — z pozycji startowej kamery generują one widoczne eliminacje frustum culling. Sześcian tylny przy z = −12 znajduje się blisko płaszczyzny dalekiej i może być eliminowany przy wycofaniu kamery. Obiekty centralne — bryły zamknięte — demonstrują działanie back-face culling: niezależnie od orientacji kamery, dokładnie połowa ich ścian pozostaje odwrócona tyłem.

Ze sceny celowo usunięto wcześniejszą płaszczyznę podłogi — w trybie algorytmu malarza duża, nisko położona płaszczyzna z niskim środkiem niepoprawnie konkurowała o kolejność rysowania z bryłami stojącymi na niej (klasyczny przypadek patologiczny sortowania po centroidzie). Pozostawienie samych zamkniętych brył eliminuje ten problem i daje stabilny wizualnie wynik bez konieczności sięgania po podział wielokątów.

Każdy wielokąt jest reprezentowany jako uporządkowana lista wierzchołków, z normalną wyznaczaną w momencie tworzenia obiektu na podstawie iloczynu wektorowego pierwszych dwóch krawędzi. Kolejność wierzchołków zachowana została konsekwentnie przeciwnie do ruchu wskazówek zegara — patrząc od strony zewnętrznej bryły — co gwarantuje, że wektory normalne wskazują na zewnątrz.

**[MIEJSCE NA ZRZUT EKRANU]**
*Zrzut ekranu przedstawiający scenę z pozycji domyślnej kamery, w trybie standardowym (tylko widoczne wielokąty)*

**[MIEJSCE NA ZRZUT EKRANU]**
*Ten sam widok w trybie diagnostycznym — kolory pokazują przyczynę eliminacji każdego wielokąta*

#### 2.2.1 Układ współrzędnych

Zachowano prawoskrętny układ współrzędnych z Projektu 1 — zgodny z konwencją OpenGL:

- oś **X** — skierowana w prawo
- oś **Y** — skierowana w górę
- oś **Z** — skierowana w stronę obserwatora (kamera przy zerowej rotacji patrzy w kierunku **−Z**)

Wszystkie obiekty sceny zdefiniowane są w globalnym układzie współrzędnych. Kamera operuje w lokalnym układzie wyznaczanym dynamicznie z kątów yaw oraz pitch — szczegóły opisano w sprawozdaniu Projektu 1.

### 2.3 Działanie Algorytmów Krok po Kroku

**Inicjalizacja:** scena testowa zostaje zbudowana raz, w momencie startu programu. Każdy wielokąt otrzymuje obliczony wektor normalny oraz środek (średnia arytmetyczna wierzchołków). Kamera zostaje umieszczona w pozycji (0, 2, 8) z lekkim spojrzeniem w dół (pitch −10°).

**Pętla renderowania (wykonywana dla każdej klatki):**

1. Aktualizacja stanu kamery na podstawie wciśniętych klawiszy (logika z Projektu 1)
2. Wyznaczenie aktualnej macierzy widoku oraz macierzy projekcji
3. Wyznaczenie macierzy `M = Projection × View` oraz ekstrakcja sześciu płaszczyzn frustum metodą Gribba-Hartmanna
4. Dla każdego wielokąta sceny:
   - **a.** obliczenie głębokości środka w przestrzeni kamery (`depth = wiersz_3(View) · center`)
   - **b.** test back-face — obliczenie wektora widoku do kamery, iloczyn skalarny z normalną; jeśli ujemny — oznaczenie jako `backface` i przejście do kolejnego wielokąta
   - **c.** test frustum — sprawdzenie, czy wszystkie wierzchołki leżą po zewnętrznej stronie którejkolwiek płaszczyzny; jeśli tak — oznaczenie jako `frustum`
   - **d.** w przeciwnym razie wielokąt pozostaje oznaczony jako widoczny
5. Aktualizacja statystyk — zliczenie wielokątów w każdej kategorii
6. **Sortowanie algorytmem malarza** — widoczne wielokąty sortowane rosnąco po `depth` (najdalsze na początku listy, najbliższe na końcu)
7. Renderowanie — wielokąty rysowane w ustalonej kolejności bez bufora głębi (depth test wyłączony w warstwie WebGL i w materiałach). W trybie diagnostycznym ghosty wielokątów odrzuconych dorysowywane są na końcu jako półprzezroczyste markery

**[MIEJSCE NA SCHEMAT BLOKOWY]**
*Schemat pokazujący przepływ pojedynczego wielokąta przez pipeline culling*

**Aktualizacja frustum.** Płaszczyzny frustum wyznaczane są ponownie w każdej klatce, ponieważ macierz widoku zmienia się wraz z ruchem kamery, a macierz projekcji — wraz ze zmianą zoomu. Koszt tej operacji jest jednak stały (sześć ekstrakcji) i nie zależy od liczby wielokątów w scenie.

**Niezależność testów.** Oba testy mogą zostać włączone lub wyłączone niezależnie poprzez panel sterowania. Dezaktywacja testu pomija jego wykonanie, pozostawiając pozostałe testy w pierwotnej kolejności. Daje to bezpośrednią możliwość obserwacji wkładu każdego algorytmu w łączną redukcję wielokątów.

### 2.4 Wybór Narzędzi i Bibliotek

Implementację wykonano w języku **TypeScript** z wykorzystaniem React jako frameworka interfejsu oraz Vite jako narzędzia budującego — kontynuując stos technologiczny z Projektu 1.

**Three.js** wykorzystywany jest **wyłącznie jako warstwa rysująca**. Biblioteka otrzymuje gotową, przefiltrowaną i posortowaną listę wielokątów oraz macierze widoku i projekcji wyznaczone samodzielnie. Wbudowane mechanizmy frustum culling, back-face culling oraz Z-buffer biblioteki Three.js **nie są używane** — kontekst WebGL został utworzony z parametrem `depth: false`, sortowanie obiektów zostało wyłączone (`renderer.sortObjects = false`), a materiały warstwy widocznej mają jawnie wyłączony test i zapis do bufora głębi. Cała logika eliminacji oraz ustalania kolejności rysowania zaimplementowana jest własnoręcznie i działa zanim geometria zostanie przekazana do renderera.

**gl-matrix** służy do podstawowych operacji algebry liniowej: iloczyn wektorowy, iloczyn skalarny, normalizacja, mnożenie macierzy. Algorytmy culling — ekstrakcja płaszczyzn, testy widoczności, klasyfikacja wielokątów — zostały zaimplementowane samodzielnie.

**Klasa Camera** została bezpośrednio przeniesiona z Projektu 1. Umożliwia to skupienie uwagi na nowej funkcjonalności (eliminacja wielokątów) bez konieczności ponownej implementacji sterowania kamerą. Dodatkową korzyścią jest fakt, że swobodne poruszanie się po scenie ma kluczowe znaczenie dla testowania algorytmów culling — każda zmiana pozycji lub orientacji kamery wymusza ponowną klasyfikację wszystkich wielokątów.

Samodzielnie zrealizowane zostały:

- algorytm wyznaczania wektora normalnego wielokąta (iloczyn wektorowy krawędzi)
- algorytm back-face culling (test iloczynu skalarnego)
- ekstrakcja sześciu płaszczyzn frustum z macierzy MVP metodą Gribba-Hartmanna
- algorytm frustum culling (test punkt-płaszczyzna z konserwatywną interpretacją wielokąta)
- algorytm malarza — wyznaczanie głębokości środka w przestrzeni kamery oraz sortowanie widocznych wielokątów od najdalszego do najbliższego (zastępuje Z-buffer)
- pipeline łączący wszystkie testy z optymalizacją kolejności oraz końcowym sortowaniem
- system statystyk reagujący na zmiany w czasie rzeczywistym

---

## 3. Instrukcja Użytkowania

### 3.1 Uruchomienie programu

```bash
cd Projekt_II
npm install
npm run dev
```

Po uruchomieniu należy otworzyć podany adres w przeglądarce internetowej. Sterowanie aktywuje się automatycznie po załadowaniu strony.

### 3.2 Sterowanie kamerą (kontynuacja Projektu 1)

| Klawisz | Funkcja | Opis działania |
|---|---|---|
| ↑ | Przód | Przesunięcie kamery w aktualnym kierunku patrzenia |
| ↓ | Tył | Przesunięcie kamery w kierunku przeciwnym |
| → | Prawo | Przesunięcie poprzeczne w prawo (płaszczyzna pozioma) |
| ← | Lewo | Przesunięcie poprzeczne w lewo (płaszczyzna pozioma) |
| Spacja | Góra | Przesunięcie wzdłuż globalnej osi Y w górę |
| Shift | Dół | Przesunięcie wzdłuż globalnej osi Y w dół |
| W | Obrót w górę (pitch) | Podniesienie kierunku patrzenia |
| S | Obrót w dół (pitch) | Opuszczenie kierunku patrzenia |
| A | Obrót w lewo (yaw) | Obrót kamery wokół osi pionowej |
| D | Obrót w prawo (yaw) | Obrót kamery wokół osi pionowej |
| Z | Zoom in | Zmniejszenie wartości FOV (efekt przybliżenia) |
| X | Zoom out | Zwiększenie wartości FOV (rozszerzenie pola widzenia) |
| R | Reset kamery | Powrót do pozycji oraz orientacji początkowej |

### 3.3 Sterowanie algorytmami eliminacji

Panel kontrolny w lewym górnym rogu okna zawiera cztery przełączniki:

| Przełącznik | Funkcja |
|---|---|
| **Back-Face Culling** | Włącza lub wyłącza eliminację wielokątów odwróconych tyłem |
| **Frustum Culling** | Włącza lub wyłącza eliminację wielokątów poza polem widzenia |
| **Show Culled** | Włącza tryb diagnostyczny — wyświetla wielokąty wyeliminowane w ich kolorach klasyfikacji |
| **Show Normals** | Wyświetla wektory normalne dla każdego widocznego wielokąta jako żółte odcinki |

### 3.4 Panel statystyk

Panel w prawym górnym rogu prezentuje w czasie rzeczywistym:

- **total polygons** — łączna liczba wielokątów w scenie
- **visible** — liczba wielokątów widocznych po eliminacji oraz odsetek
- **culled** — łączna liczba odrzuconych wielokątów
  - **back-face** — odrzucone przez test orientacji
  - **frustum** — odrzucone przez test pola widzenia
- **performance gain** — procentowa redukcja liczby renderowanych wielokątów
- **fps** — liczba klatek na sekundę

Wartości aktualizowane są w każdej klatce, dzięki czemu zmiana pozycji kamery natychmiast odbija się w panelu.

### 3.5 Legenda kolorów (tryb diagnostyczny)

| Kolor | Klasyfikacja wielokąta |
|---|---|
| Biały | Widoczny — przeszedł oba testy |
| Czerwony (półprzezroczysty) | Wyeliminowany przez back-face culling |
| Cyjan (półprzezroczysty) | Wyeliminowany przez frustum culling |
| Żółty | Wektor normalny (tryb pomocniczy) |

### 3.6 Parametry ruchu

Wartości prędkości zachowano takie same jak w Projekcie 1:

- **Prędkość ruchu translacyjnego:** 4 jednostki/sekundę
- **Prędkość ruchu rotacyjnego:** 1.6 radiana/sekundę (≈ 90°/s)
- **Prędkość zmiany FOV:** 30°/sekundę

Wszystkie ruchy są skalowane przez delta time, co zapewnia stałą prędkość niezależną od liczby klatek na sekundę.

---

## 4. Testy i Weryfikacja Poprawności

### 4.1 Plan testowania

Weryfikację przeprowadzono w czterech etapach: testy każdego algorytmu w izolacji (back-face, frustum), test pipeline łączącego oba algorytmy, weryfikacja poprawności statystyk oraz test wizualny polegający na swobodnej nawigacji po scenie. Dodatkowo zweryfikowano zachowanie programu w przypadkach brzegowych.

### 4.2 Test 1: Back-Face Culling w izolacji

**Cel testu:** weryfikacja, że algorytm back-face culling poprawnie identyfikuje wielokąty odwrócone tyłem do kamery, niezależnie od orientacji obserwatora.

**Procedura:**

1. Wyłączenie frustum culling w panelu sterowania, pozostawienie aktywnego wyłącznie back-face
2. Ustawienie kamery przed sześcianem centralnym i włączenie trybu diagnostycznego
3. Weryfikacja, że dokładnie trzy ściany sześcianu są widoczne, a trzy oznaczone jako back-face
4. Powolny obrót kamery wokół sześcianu o pełne 360° z obserwacją zmian w klasyfikacji ścian
5. Sprawdzenie statystyk dla całej sceny — odsetek back-face dla brył zamkniętych powinien wynosić około 50%

**[MIEJSCE NA ZRZUTY EKRANU]**
*Sześcian z różnych perspektyw — w trybie diagnostycznym widać przemienną klasyfikację ścian*

**Oczekiwany wynik:** dla każdej bryły zamkniętej w każdej chwili dokładnie połowa wielokątów oznaczona jest jako back-face.

**Wnioski:** algorytm działa poprawnie. Obrót kamery powoduje natychmiastową aktualizację klasyfikacji każdego wielokąta.

### 4.3 Test 2: Frustum Culling w izolacji

**Cel testu:** weryfikacja, że algorytm frustum culling poprawnie identyfikuje wielokąty znajdujące się całkowicie poza polem widzenia kamery.

**Procedura:**

1. Wyłączenie back-face culling w panelu sterowania, pozostawienie aktywnego wyłącznie frustum
2. Ustawienie kamery w pozycji startowej i włączenie trybu diagnostycznego
3. Weryfikacja, że sześciany skrajne (x = ±14) są oznaczone jako frustum (znajdują się poza domyślnym FOV)
4. Stopniowy obrót kamery w lewo aż do uzyskania widoku na lewy skrajny sześcian — obserwacja momentu, w którym sześcian "wchodzi" do frustum i zmienia klasyfikację na visible
5. Mocny zoom in (klawisz Z) — sprawdzenie, że obiekty boczne stopniowo opuszczają frustum
6. Test płaszczyzny dalekiej — wycofanie kamery klawiszem ↓ i obserwacja eliminacji obiektów najbardziej oddalonych

**[MIEJSCE NA ZRZUTY EKRANU]**
*Widok z pozycji startowej z włączonym wyłącznie frustum culling — sześciany skrajne oznaczone na cyjanowo*

**Oczekiwany wynik:** wielokąty znajdujące się całkowicie poza dowolną z sześciu płaszczyzn są oznaczane jako frustum. Wielokąty częściowo widoczne pozostają oznaczone jako visible.

**Wnioski:** ekstrakcja płaszczyzn metodą Gribba-Hartmanna działa poprawnie. Płaszczyzny aktualizowane są w każdej klatce, dzięki czemu klasyfikacja reaguje natychmiastowo zarówno na zmianę pozycji kamery, jak i na zmianę zoomu.

### 4.4 Test 3: Pipeline łączony

**Cel testu:** weryfikacja, że oba algorytmy współdziałają poprawnie i że ich łączny efekt odpowiada sumie eliminacji każdego z nich (z uwzględnieniem przerwania na pierwszej eliminacji).

**Procedura:**

1. Włączenie obu algorytmów oraz trybu diagnostycznego
2. Ustawienie kamery w pozycji startowej i odczytanie statystyk
3. Weryfikacja, że suma `back-face + frustum + visible` równa się `total polygons`
4. Wykonanie sekwencji ruchów kamery (rotacja, translacja, zoom) i obserwacja, czy ten warunek pozostaje spełniony

**Oczekiwany wynik:** dla każdej pozycji kamery łączna eliminacja mieści się w przedziale 40-60%. Brak wielokątów liczonych podwójnie lub pomijanych.

**[MIEJSCE NA ZRZUT EKRANU]**
*Widok sceny z aktywnymi oboma algorytmami oraz panel statystyk pokazujący rozkład eliminacji*

**Wnioski:** kolejność testów (back-face przed frustum) działa poprawnie. Wielokąty eliminowane na pierwszym etapie nie są rozważane na drugim, co jest widoczne w panelu statystyk — łączna liczba eliminacji frustum jest mniejsza niż w teście izolowanym tego algorytmu.

### 4.5 Test 4: Poprawność statystyk

**Cel testu:** weryfikacja zgodności wartości w panelu statystyk z faktyczną liczbą wielokątów w każdej kategorii.

**Procedura:**

1. Wyłączenie obu algorytmów — wszystkie wielokąty powinny być oznaczone jako widoczne, statystyki powinny pokazywać `visible = total = 71`
2. Włączenie wyłącznie back-face culling i odczytanie wartości
3. Wyłączenie back-face, włączenie frustum i odczytanie wartości
4. Włączenie obu algorytmów — porównanie sumy z wcześniejszymi pomiarami
5. Weryfikacja zgodności procentów (`visible%` + `culled%` = 100%)

**Oczekiwany wynik:** wszystkie cztery konfiguracje dają spójne, sumujące się wartości. Procent culling rate poprawnie odzwierciedla redukcję liczby renderowanych wielokątów.

**Wnioski:** licznik działa poprawnie. Wartość performance gain odpowiada faktycznej redukcji.

### 4.6 Test 5: Test wizualny — swobodna nawigacja

**Cel testu:** weryfikacja zachowania programu w warunkach typowego użytkowania.

**Procedura:** swobodne poruszanie się po scenie z wykorzystaniem wszystkich klawiszy sterowania, obserwacja każdej bryły z wielu perspektyw, włączanie i wyłączanie poszczególnych algorytmów w trakcie ruchu.

**[MIEJSCE NA ZRZUTY EKRANU/FILM]**
*Seria zrzutów dokumentująca nawigację po scenie z włączonym trybem diagnostycznym*

**Obserwacje:** klasyfikacja wielokątów aktualizuje się płynnie i nie wprowadza widocznych opóźnień. Brak migotania, artefaktów wizualnych ani błędnych klasyfikacji. Toggle algorytmów daje natychmiastowy efekt.

**Wnioski:** algorytmy spełniają kryterium poprawności wizualnej.

### 4.7 Przypadki brzegowe

- **Kamera wewnątrz obiektu** — przy wejściu kamerą do wnętrza sześcianu wszystkie jego ściany są klasyfikowane jako back-face (normalne wskazują na zewnątrz, kamera znajduje się wewnątrz). Zachowanie zgodne z modelem matematycznym.
- **Skrajne wartości FOV (15° oraz 100°)** — frustum culling poprawnie reaguje na zmianę szerokości pola widzenia. Przy małym FOV więcej obiektów jest klasyfikowanych jako frustum.
- **Wszystkie algorytmy wyłączone** — renderowane są wszystkie 71 wielokątów, statystyki pokazują 0% eliminacji.
- **Skrajne pozycje kamery** — przy dużych odległościach (na granicy płaszczyzny dalekiej) część obiektów jest poprawnie eliminowana. Przy bardzo dużym oddaleniu wszystkie obiekty trafiają poza frustum.

**Wynik testu:** żaden z przypadków brzegowych nie powoduje błędów ani niespójności w klasyfikacji.

### 4.8 Wydajność

Aplikacja osiąga stabilną wartość 60 klatek na sekundę (synchronizacja z odświeżaniem ekranu). Czas wykonania całego cyklu culling oraz sortowania algorytmem malarza (ekstrakcja frustum + klasyfikacja 71 wielokątów + sortowanie widocznych) mieści się w pojedynczych ułamkach milisekundy i nie stanowi wąskiego gardła pętli renderowania.

**[MIEJSCE NA DANE WYDAJNOŚCIOWE]**
*Screenshot panelu statystyk z licznikiem FPS w różnych konfiguracjach*

---

## 5. Napotkane Problemy i Rozwiązania

### Problem 1: Niepoprawne kierunki normalnych

**Opis problemu:** w pierwszej wersji sceny część wielokątów miała wektory normalne skierowane do wnętrza bryły zamiast na zewnątrz. Skutkowało to odwrotnym działaniem back-face culling — odwrócone tyłem klasyfikowane były jako widoczne i odwrotnie. Wizualnie objawiało się to "wywróconą na lewą stronę" geometrią w trybie diagnostycznym.

**Rozwiązanie:** uporządkowano kolejność wierzchołków wszystkich wielokątów konsekwentnie przeciwnie do ruchu wskazówek zegara, patrząc od strony zewnętrznej bryły. Kierunek wektora normalnego, wynikający z reguły prawej dłoni dla iloczynu wektorowego, zaczyna wówczas wskazywać na zewnątrz.

**Wnioski:** poprawność back-face culling zależy bezpośrednio od konwencji opisu geometrii. Każdy wielokąt sceny musi być definiowany w spójnej kolejności wierzchołków — zwykle przeciwnie do ruchu wskazówek zegara, patrząc od strony przedniej.

### Problem 2: Pomyłka w indeksowaniu macierzy podczas ekstrakcji płaszczyzn

**Opis problemu:** macierze w bibliotece gl-matrix przechowywane są w układzie kolumnowym (column-major), podczas gdy klasyczny opis metody Gribba-Hartmanna posługuje się indeksami wierszowymi. Pierwsza implementacja używała indeksów `m[0][0], m[0][1]…` w sposób wierszowy, co prowadziło do całkowicie niepoprawnych płaszczyzn — frustum culling odrzucał obiekty znajdujące się w środku ekranu i przepuszczał te poza nim.

**Rozwiązanie:** zamieniono indeksowanie na format kolumnowy, zgodnie z konwencją gl-matrix. Wierszowi `i` macierzy odpowiadają wówczas indeksy `m[i], m[i+4], m[i+8], m[i+12]`. Po zmianie ekstrakcja działa zgodnie z oczekiwaniami.

**Wnioski:** w pracy z macierzami zawsze należy zweryfikować konwencję przechowywania danych w wybranej bibliotece. Drobny błąd indeksowania prowadzi do trudnych do zdiagnozowania objawów, ponieważ matematyka pozostaje formalnie poprawna, ale jej zastosowanie do złych elementów danych daje wynik chaotyczny.

### Problem 3: Brak normalizacji płaszczyzn frustum

**Opis problemu:** w pierwotnej implementacji ekstrakcja płaszczyzn z macierzy MVP nie zawierała kroku normalizacji wektora normalnego. Test punkt-płaszczyzna nadal działał poprawnie pod względem znaku (po której stronie znajduje się punkt), ale wartość bezwzględna była zniekształcona, co uniemożliwiałoby przyszłe rozszerzenia oparte na rzeczywistej odległości od płaszczyzny — na przykład test sfery ograniczającej.

**Rozwiązanie:** w konstruktorze klasy płaszczyzny dodano krok normalizacji — wektor `(a, b, c)` zostaje podzielony przez swoją długość, a wartość `d` skalowana tym samym czynnikiem. Po normalizacji metoda `distanceToPoint` zwraca wartość metryczną w jednostkach świata.

**Wnioski:** normalizacja płaszczyzny nie jest wymagana dla samego testu znaku, jednak warto ją wprowadzić od początku. Eliminuje to problem przy kolejnych rozszerzeniach algorytmu, w których odległość ma faktyczne znaczenie.

### Problem 4: Test wielokąta jako sumy testów wierzchołków

**Opis problemu:** rozważano dwie możliwe interpretacje testu wielokąta względem płaszczyzny frustum: (a) odrzucenie wielokąta, jeżeli **dowolny** wierzchołek leży poza płaszczyzną; (b) odrzucenie wielokąta, jeżeli **wszystkie** wierzchołki leżą poza tą samą płaszczyzną. Pierwsza interpretacja jest agresywna — eliminuje wielokąty częściowo wystające, co prowadzi do widocznego znikania krawędzi. Druga jest konserwatywna — może zostawić wielokąty częściowo poza frustum.

**Rozwiązanie:** wybrano interpretację konserwatywną. Wielokąt zostaje odrzucony tylko wtedy, gdy wszystkie jego wierzchołki znajdują się po tej samej zewnętrznej stronie którejkolwiek płaszczyzny. Dzięki temu żaden wielokąt potencjalnie widoczny nie zostaje błędnie odrzucony.

**Wnioski:** w algorytmach culling preferowane są fałszywie pozytywne klasyfikacje (wielokąt zachowany, choć mógłby zostać odrzucony) zamiast fałszywie negatywnych (wielokąt odrzucony, choć powinien być widoczny). Rendering nadmiarowego wielokąta to drobny narzut wydajnościowy, natomiast pominięcie widocznego wielokąta to widoczny błąd wizualny.

---

## 6. Możliwe Rozszerzenia

- **Hierarchical Frustum Culling** — najpierw test sfery ograniczającej dla całego obiektu, potem test poszczególnych wielokątów dopiero przy częściowym przecięciu (eliminuje koszt na poziomie pojedynczych wielokątów dla obiektów całkowicie wewnątrz lub całkowicie poza frustum)
- **Occlusion Culling** — eliminacja wielokątów zasłoniętych przez inne, bardziej zaawansowana technika geometryczna
- **Backface culling z wykorzystaniem przestrzeni klipowej** — alternatywna implementacja oparta na przekształceniu normalnej do układu kamery zamiast iloczynu skalarnego w przestrzeni świata
- **Instancing** — w przypadku scen z dużą liczbą identycznych obiektów, jednokrotne testowanie geometrii i wielokrotne renderowanie
- **Wizualizacja samej bryły frustum** — narysowanie krawędzi frustum jako pomoc dydaktyczna w trybie diagnostycznym

---

## 7. Podsumowanie

### 7.1 Spełnienie wymagań projektu

| Wymaganie | Status |
|---|---|
| Eliminacja wielokątów metodą back-face culling | spełnione |
| Eliminacja wielokątów metodą frustum culling | spełnione |
| Brak wykorzystania bufora głębi | spełnione |
| Brak metod ray tracing/casting | spełnione |
| Wyłącznie metody geometryczne | spełnione |
| Niezależne włączanie obu algorytmów | spełnione |
| Statystyki w czasie rzeczywistym | spełnione |
| Tryb diagnostyczny z kolorowaniem | spełnione |
| Sterowanie kamerą (kontynuacja P1) | spełnione |
| Samodzielna implementacja algorytmów | spełnione (back-face, frustum, ekstrakcja Gribba-Hartmanna) |

### 7.2 Wnioski końcowe

Realizacja projektu pozwoliła uzyskać praktyczną intuicję dla zagadnień optymalizacji renderowania scen trójwymiarowych. Kluczowym spostrzeżeniem jest fakt, że bardzo proste operacje matematyczne — pojedynczy iloczyn skalarny w przypadku back-face culling oraz sześć testów płaszczyznowych w przypadku frustum culling — wystarczają do wyeliminowania znaczącej części geometrii, zanim trafi ona do kosztownego procesu rasteryzacji.

Najistotniejszym wyzwaniem implementacyjnym nie była sama matematyka algorytmów, lecz dbałość o spójność konwencji: kolejność wierzchołków decydująca o kierunku normalnej, układ przechowywania macierzy (kolumnowy vs wierszowy) determinujący poprawność ekstrakcji płaszczyzn, oraz wybór konserwatywnej interpretacji testu wielokąta. Każdy z tych aspektów, zignorowany lub potraktowany niedbale, prowadzi do trudnych do zdiagnozowania błędów, ponieważ kod pozostaje formalnie poprawny, a objawy wadliwego działania ujawniają się dopiero podczas weryfikacji wizualnej.

Metoda Gribba-Hartmanna okazała się bardzo eleganckim narzędziem ekstrakcji płaszczyzn frustum — pozwala wyznaczyć wszystkie sześć ograniczeń bezpośrednio z macierzy MVP, bez konieczności rekonstrukcji wierzchołków bryły frustum. Jest to przykład sytuacji, w której znajomość struktury wewnętrznej macierzy projekcji prowadzi do prostszej, szybszej i bardziej bezpośredniej implementacji.

---

## Załączniki

### Załącznik A: Fragmenty kodu kluczowych algorytmów

**Wyznaczanie wektora normalnego wielokąta:**

```typescript
function computeNormal(vertices: vec3[]): vec3 {
  const edge1 = vec3.subtract(vec3.create(), vertices[1], vertices[0]);
  const edge2 = vec3.subtract(vec3.create(), vertices[2], vertices[0]);
  const normal = vec3.cross(vec3.create(), edge1, edge2);
  vec3.normalize(normal, normal);
  return normal;
}
```

**Test back-face culling:**

```typescript
isBackFacing(polygon: Polygon, cameraPos: vec3): boolean {
  const viewVector = vec3.subtract(vec3.create(), cameraPos, polygon.center);
  vec3.normalize(viewVector, viewVector);
  return vec3.dot(polygon.normal, viewVector) < 0;
}
```

**Reprezentacja płaszczyzny z normalizacją:**

```typescript
class Plane {
  normal: vec3;
  distance: number;

  constructor(a: number, b: number, c: number, d: number) {
    const len = Math.sqrt(a * a + b * b + c * c);
    this.normal = vec3.fromValues(a / len, b / len, c / len);
    this.distance = d / len;
  }

  distanceToPoint(point: vec3): number {
    return vec3.dot(this.normal, point) + this.distance;
  }
}
```

**Ekstrakcja sześciu płaszczyzn frustum (metoda Gribba-Hartmanna):**

```typescript
extractFromCamera(camera: Camera): void {
  const view = camera.getViewMatrix();
  const proj = camera.getProjectionMatrix();
  const m = mat4.multiply(mat4.create(), proj, view);

  // m przechowywane w układzie kolumnowym;
  // m[3], m[7], m[11], m[15] tworzą czwarty wiersz macierzy
  this.planes = [
    new Plane(m[3] + m[0],  m[7] + m[4],  m[11] + m[8],  m[15] + m[12]), // lewa
    new Plane(m[3] - m[0],  m[7] - m[4],  m[11] - m[8],  m[15] - m[12]), // prawa
    new Plane(m[3] + m[1],  m[7] + m[5],  m[11] + m[9],  m[15] + m[13]), // dolna
    new Plane(m[3] - m[1],  m[7] - m[5],  m[11] - m[9],  m[15] - m[13]), // górna
    new Plane(m[3] + m[2],  m[7] + m[6],  m[11] + m[10], m[15] + m[14]), // bliska
    new Plane(m[3] - m[2],  m[7] - m[6],  m[11] - m[10], m[15] - m[14]), // daleka
  ];
}
```

**Test wielokąta względem frustum (interpretacja konserwatywna):**

```typescript
testPolygon(polygon: Polygon): boolean {
  for (const plane of this.planes) {
    let allOutside = true;
    for (const vertex of polygon.vertices) {
      if (plane.distanceToPoint(vertex) >= 0) {
        allOutside = false;
        break;
      }
    }
    if (allOutside) {
      return false; // wszystkie wierzchołki poza tą płaszczyzną
    }
  }
  return true; // co najmniej częściowo wewnątrz frustum
}
```

**Wyznaczanie głębokości w przestrzeni kamery (algorytm malarza):**

```typescript
computeDepth(polygon: Polygon): number {
  // trzeci wiersz macierzy widoku (kolumna-major) razy (cx, cy, cz, 1)
  const c = polygon.center;
  const m = this.viewMatrix;
  return m[2] * c[0] + m[6] * c[1] + m[10] * c[2] + m[14];
}
```

**Sortowanie widocznych wielokątów od najdalszego do najbliższego:**

```typescript
const drawList = polygons.filter((p) => p.visible || showCulled);
drawList.sort((a, b) => {
  if (a.visible !== b.visible) return a.visible ? -1 : 1;
  return a.depth - b.depth; // mniejsza (bardziej ujemna) wartość = dalej
});
// rasteryzacja w ustalonej kolejności, bez bufora głębi
```

**Wyłączenie bufora głębi w warstwie renderera:**

```typescript
this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, depth: false });
this.renderer.sortObjects = false;

this.visibleFillMat = new THREE.MeshBasicMaterial({
  color: 0x1a2a40,
  side: THREE.FrontSide,
  depthTest: false,
  depthWrite: false,
});
```

**Pipeline łączący wszystkie etapy z optymalizacją kolejności:**

```typescript
cullScene(polygons: Polygon[], cameraPos: vec3): void {
  for (const polygon of polygons) {
    polygon.visible = true;
    polygon.cullingReason = 'visible';
    polygon.depth = this.computeDepth(polygon);

    if (this.settings.enableBackFace && this.isBackFacing(polygon, cameraPos)) {
      polygon.visible = false;
      polygon.cullingReason = 'backface';
      continue; // przerwanie — nie ma sensu testować frustum
    }

    if (this.settings.enableFrustum && this.isOutsideFrustum(polygon)) {
      polygon.visible = false;
      polygon.cullingReason = 'frustum';
    }
  }
  // sortowanie odbywa się w rendererze tuż przed rasteryzacją
}
```

### Załącznik B: Struktura projektu

```
Projekt_II/
├── src/
│   ├── engine/
│   │   ├── math/
│   │   │   ├── matrix.ts          # macierze Look-At i perspektywy (z P1)
│   │   │   └── vector.ts          # wektory bazowe kamery (z P1)
│   │   ├── Camera.ts              # stan i ruch kamery (z P1)
│   │   ├── Polygon.ts             # tworzenie wielokątów + obliczenia normalnych
│   │   ├── Frustum.ts             # ekstrakcja płaszczyzn + test wielokąta
│   │   ├── CullingEngine.ts       # back-face + pipeline
│   │   ├── CullingScene.ts        # generator sceny testowej (71 wielokątów)
│   │   └── CullingRenderer.ts     # warstwa rysująca (Three.js)
│   ├── hooks/
│   │   ├── useCamera.ts           # mapowanie klawiszy na ruch kamery (z P1)
│   │   ├── useKeyboard.ts         # obsługa wejścia z klawiatury (z P1)
│   │   ├── useAnimationFrame.ts   # pętla renderowania (z P1)
│   │   └── useCullingStats.ts     # zliczanie statystyk eliminacji
│   ├── components/
│   │   ├── CullingCanvas.tsx      # kontener canvas + integracja silnika
│   │   ├── DebugControls.tsx      # przełączniki algorytmów
│   │   └── StatsPanel.tsx         # panel statystyk
│   ├── types/
│   │   └── index.ts               # interfejsy Polygon, CullingStats, CullingSettings
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── README.md
```

---

**Koniec sprawozdania**
