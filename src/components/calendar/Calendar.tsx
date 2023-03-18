import styles from "./Calendar.module.scss";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    differenceInCalendarDays,
    getMonth,
    isSaturday,
    isSunday,
} from "date-fns";
import { useOutletContext } from "react-router-dom";
import { UserInfoContext, UserType } from "types/ts";
import { collection } from "firebase/firestore";
import { useFirestoreQueryData } from "@react-query-firebase/firestore";
import { db } from "firebaseConfig/firebase";
import { timeUid } from "utils/common";
import { Badge, Box, Tooltip } from "@chakra-ui/react";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const weekMock = ["일", "월", "화", "수", "목", "금", "토"];
    const { userInfo } = useOutletContext<UserInfoContext>();
    const company = userInfo?.company;
    const dateContainerRef = useRef<any>();
    const boxRef = useRef<any>({});
    const adminDocRef = collection(db, company);
    const docsQuery = useFirestoreQueryData([company, timeUid()], adminDocRef, { subscribe: true })?.data;

    const docsInfo = useMemo(() => {
        if (docsQuery !== undefined) {
            const mergeObj = docsQuery?.[0];
            for (let i = 1; i < docsQuery.length; i++) {
                Object.assign(mergeObj, docsQuery?.[i]);
            }

            const adminArray: any[] = Object.values({ ...mergeObj });
            const filterArray = adminArray.filter((v) => v.status === "success");

            filterArray.sort((a, b) => +new Date(a?.startDate) - +new Date(b?.startDate));
            return filterArray;
        }
    }, [docsQuery]);

    const mobileDocsInfo = useMemo(() => {
        if (docsQuery !== undefined) {
            const mergeObj = docsQuery?.[0];
            for (let i = 1; i < docsQuery.length; i++) {
                Object.assign(mergeObj, docsQuery?.[i]);
            }

            const adminArray: any[] = Object.values({ ...mergeObj });
            const yearMonth = format(currentDate, "yyyyMM");
            const filterArray = adminArray.filter(
                (v) => v.status === "success" && yearMonth === format(new Date(v.startDate), "yyyyMM")
            );
            console.log(filterArray);

            filterArray.sort((a, b) => +new Date(a?.startDate) - +new Date(b?.startDate));
            return filterArray;
        }
    }, [docsQuery, currentDate]);

    const nextMonthHandler = useCallback(() => {
        setCurrentDate(() => addMonths(currentDate, 1));
    }, [currentDate]);
    const prevMonthHandler = useCallback(() => {
        setCurrentDate(() => subMonths(currentDate, 1));
    }, [currentDate]);
    const createMonth = useMemo(() => {
        const monthArray = [];
        let day = startDate;
        while (differenceInCalendarDays(endDate, day) >= 0) {
            monthArray.push(day);
            day = addDays(day, 1);
        }

        return monthArray;
    }, [startDate, endDate]);

    useEffect(() => {
        const heightArray: number[] = [];
        Object.values(boxRef.current).forEach((v: any, i) => {
            if (v?.childElementCount === 0) return;
            if (v) {
                let parentWidth = getComputedStyle(v.parentNode).width;
                let overWidth = 0;
                if (v.parentNode.previousElementSibling.childNodes[1].childNodes.length > 1) {
                    overWidth = v.parentNode.previousElementSibling.childNodes[1].childNodes.length;
                } else {
                    v.parentNode.previousElementSibling.childNodes[1].childNodes.forEach((node: any) => {
                        if (getComputedStyle(node).width > parentWidth) {
                            overWidth++;
                        }
                    });
                }

                v.style.top = `${(overWidth + 1) * 22}px`;
                heightArray.push(overWidth);
            }
        });
        const maxHeight = Math.max(...heightArray);
        Object.values(boxRef.current).forEach((v: any, i) => {
            if (v) {
                v.parentNode.style.height = `${maxHeight * 30}px`;
            }
        });
    }, [createMonth, docsInfo, boxRef.current]);

    return (
        <>
            <section className={styles.calendar}>
                <div className={styles.yearTitle}>{format(currentDate, "yyyy년")}</div>
                <div className={styles.monthTitle}>
                    <button className={styles.prevButton} onClick={prevMonthHandler}>
                        <ChevronLeftIcon
                            _hover={{
                                backgroundColor: "#bee3f8",
                            }}
                        />
                    </button>
                    <div className={styles.month}>{format(currentDate, "M월")}</div>
                    <button className={styles.nextButton} onClick={nextMonthHandler}>
                        <ChevronRightIcon
                            _hover={{
                                backgroundColor: "#bee3f8",
                            }}
                        />
                    </button>
                </div>
                <div className={styles.dayContainer}>
                    {weekMock.map((v, i) => {
                        let style;
                        if (i === 0) {
                            style = {
                                color: "red",
                            };
                        } else if (i === 6) {
                            style = {
                                color: "blue",
                            };
                        }

                        return (
                            <div key={`day${i}`} style={style}>
                                {v}
                            </div>
                        );
                    })}
                </div>
                <div className={styles.dateContainer} ref={dateContainerRef}>
                    {createMonth.map((v, i) => {
                        const date = format(v, "yyyy/MM/dd");
                        let style;
                        const validation = getMonth(currentDate) === getMonth(v);
                        const today = format(new Date(), "yyyyMMdd") === format(v, "yyyyMMdd");

                        if (validation && isSaturday(v)) {
                            style = {
                                color: "blue",
                            };
                        } else if (validation && isSunday(v)) {
                            style = {
                                color: "red",
                            };
                        }

                        return (
                            <div key={`date${i}`} className={validation ? styles.currentMonth : styles.diffMonth}>
                                <div className={styles.topLine}>
                                    <span className={styles.day}>{format(v, "d")}</span>
                                    {today && <span className={styles.today}>(오늘)</span>}
                                </div>
                                <Box
                                    position="absolute"
                                    w="100%"
                                    zIndex="100"
                                    className="docBox"
                                    ref={(element) => {
                                        return (boxRef.current[i] = element);
                                    }}
                                >
                                    {docsInfo?.map((doc) => {
                                        if (
                                            differenceInCalendarDays(new Date(doc.startDate), v) <= 0 &&
                                            differenceInCalendarDays(new Date(doc.endDate), v) >= 0
                                        ) {
                                            if (
                                                date === doc.startDate &&
                                                differenceInCalendarDays(
                                                    new Date(doc.endDate),
                                                    endOfWeek(new Date(doc.startDate))
                                                ) <= 0
                                            ) {
                                                const width =
                                                    differenceInCalendarDays(
                                                        new Date(doc.endDate),
                                                        new Date(doc.startDate)
                                                    ) + 1;

                                                return (
                                                    <AnnualBox
                                                        doc={doc}
                                                        width={width}
                                                        key={`${doc.documentUid}+${v}`}
                                                        boxRef={boxRef}
                                                    />
                                                );
                                            }
                                            if (
                                                date === doc.startDate &&
                                                differenceInCalendarDays(
                                                    new Date(doc.endDate),
                                                    endOfWeek(new Date(doc.startDate))
                                                ) >= 0
                                            ) {
                                                const width =
                                                    differenceInCalendarDays(
                                                        endOfWeek(new Date(doc.startDate)),
                                                        new Date(doc.startDate)
                                                    ) + 1;
                                                return (
                                                    <AnnualBox
                                                        doc={doc}
                                                        width={width}
                                                        key={`${doc.documentUid}+${v}`}
                                                        boxRef={boxRef}
                                                    />
                                                );
                                            }

                                            if (
                                                isSunday(v) &&
                                                differenceInCalendarDays(
                                                    new Date(doc.endDate),
                                                    endOfWeek(new Date(v))
                                                ) <= 0
                                            ) {
                                                const width = differenceInCalendarDays(new Date(doc.endDate), v) + 1;
                                                return (
                                                    <AnnualBox
                                                        doc={doc}
                                                        width={width}
                                                        key={`${doc.documentUid}+${v}`}
                                                        boxRef={boxRef}
                                                    />
                                                );
                                            }

                                            if (
                                                isSunday(v) &&
                                                differenceInCalendarDays(
                                                    new Date(doc.endDate),
                                                    endOfWeek(new Date(v))
                                                ) >= 0
                                            ) {
                                                const width = differenceInCalendarDays(endOfWeek(new Date(v)), v) + 1;
                                                return (
                                                    <AnnualBox
                                                        doc={doc}
                                                        width={width}
                                                        key={`${doc.documentUid}+${v}`}
                                                        boxRef={boxRef}
                                                    />
                                                );
                                            }
                                        }
                                    })}
                                </Box>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* mobile */}
            <section className={styles.mobileCalendar}>
                <div className={styles.mobileContainer}>
                    <div className={styles.mobileDateContainer}>
                        <div className={styles.mobileYearTitle}>{format(currentDate, "yyyy년")}</div>
                        <div className={styles.mobileMonthTitle}>
                            <button className={styles.prevButton} onClick={prevMonthHandler}>
                                <ChevronLeftIcon
                                    _hover={{
                                        backgroundColor: "#bee3f8",
                                    }}
                                />
                            </button>
                            <div className={styles.mobileMonth}>{format(currentDate, "M월")}</div>
                            <button className={styles.nextButton} onClick={nextMonthHandler}>
                                <ChevronRightIcon
                                    _hover={{
                                        backgroundColor: "#bee3f8",
                                    }}
                                />
                            </button>
                        </div>
                    </div>

                    <ul>
                        {mobileDocsInfo?.map((doc,index) => {
                            const annualCount =
                                differenceInCalendarDays(new Date(doc.endDate), new Date(doc.startDate)) + 1;
                            return (
                                    <li className={styles.mobileList} key={`${doc.title} + ${index + 1}`}>
                                        <div className={styles.left}>
                                            <Badge fontSize="0.9rem">
                                                {`${doc.startDate}~${doc.endDate} (${annualCount}일)`}
                                            </Badge>
                                            <Badge bg={doc.type === "full" ? "blue.100" : "green.100"}>
                                                {doc.type === "full" ? "연차" : "반차"}
                                            </Badge>
                                        </div>
                                        <div className={styles.right}>
                                            <Badge bg="teal.200">{doc.name} </Badge>
                                        </div>
                                    </li>
                            );
                        })}
                    </ul>
                </div>
            </section>
        </>
    );
};

export default Calendar;

const AnnualBox = ({ width, doc, boxRef }: { width: number; doc: any; boxRef: any }) => {
    const onHoverHandler = (e: any) => {
        const dataId = e.target.dataset.id;
        Object.values(boxRef.current).forEach((v: any, i) => {
            if (v?.childElementCount === 0) return;
            v?.childNodes?.forEach((child: any) => {
                if (dataId === child.dataset.id) {
                    child.style.boxShadow = "0 0 2px 0 #3498db inset, 0 0 2px 2px #3498db";
                }
            });
        });
    };

    const outHoverHandler = () => {
        Object.values(boxRef.current).forEach((v: any, i) => {
            if (v?.childElementCount === 0) return;
            v?.childNodes?.forEach((child: any) => {
                child.style.boxShadow = "";
            });
        });
    };
    return (
        <Box
            className={styles.doc}
            width={`${100 * width}%`}
            bg={`#${doc.color}`}
            color="#fff"
            fontWeight="bold"
            ml={`${width - 1}px`}
            mt="2px"
            fontSize="0.8rem"
            p="1px"
            textShadow="0px 0px 2px #000"
            position="relative"
            _hover={{
                boxShadow: "0 0 10px 0 $blue inset, 0 0 10px 4px $blue",
                zIndex: "9999",
            }}
            data-id={doc.documentUid}
            onMouseEnter={onHoverHandler}
            onMouseLeave={outHoverHandler}
            cursor="pointer"
        >
            <Tooltip
                hasArrow
                label={`${doc.type === "full" ? "연차" : "반차"} ${doc.startDate}~${doc.endDate}`}
                bg="blue.600"
                cursor="pointer"
            >
                <span className={styles.docName}>{doc.name}</span>
            </Tooltip>
        </Box>
    );
};
