import styles from "./Calendar.module.scss";
import { ChevronRightIcon, ChevronLeftIcon } from "@chakra-ui/icons";
import { useCallback, useMemo, useState } from "react";
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
import { UserType } from "types/ts";
import { collection } from "firebase/firestore";
import { useFirestoreQueryData } from "@react-query-firebase/firestore";
import { db } from "firebaseConfig/firebase";
import { timeUid } from "utils/common";
import { Box, Tooltip } from "@chakra-ui/react";

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const weekMock = ["일", "월", "화", "수", "목", "금", "토"];
    const userInfo: UserType = useOutletContext().userInfo;
    const userUid = useOutletContext().userUid;
    const company = userInfo?.company;

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
            return filterArray;
        }
    }, [docsQuery]);

    const nextMonthHandler = useCallback(() => {
        setCurrentDate(addMonths(currentDate, 1));
    }, [currentDate]);
    const prevMonthHandler = useCallback(() => {
        setCurrentDate(subMonths(currentDate, 1));
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
    return (
        <section className={styles.calendar}>
            <div className={styles.yearTitle}>{format(currentDate, "yyyy년")}</div>
            <div className={styles.monthTitle}>
                <button className={styles.prevButton} onClick={prevMonthHandler}>
                    <ChevronLeftIcon />
                </button>
                <div className={styles.month}>{format(currentDate, "M월")}</div>
                <button className={styles.nextButton} onClick={nextMonthHandler}>
                    <ChevronRightIcon />
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
            <div className={styles.dateContainer}>
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
                        <div
                            key={`date${i}`}
                            className={validation ? styles.currentMonth : styles.diffMonth}
                            style={style}
                        >
                            <div className={styles.topLine}>
                                <span className={styles.day}>{format(v, "d")}</span>
                                {today && <span className={styles.today}>(오늘)</span>}
                            </div>
                            <Box
                                position="absolute"
                                w="100%"
                                zIndex="100"
                                _hover={{
                                    zIndex: "9999",
                                    opacity: "0.9",
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
                                                <AnnualBox doc={doc} width={width} key={`${doc.documentUid}+${v}`} />
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
                                                <AnnualBox doc={doc} width={width} key={`${doc.documentUid}+${v}`} />
                                            );
                                        }

                                        if (
                                            isSunday(v) &&
                                            differenceInCalendarDays(new Date(doc.endDate), endOfWeek(new Date(v))) <= 0
                                        ) {
                                            const width = differenceInCalendarDays(new Date(doc.endDate), v) + 1;
                                            return (
                                                <AnnualBox doc={doc} width={width} key={`${doc.documentUid}+${v}`} />
                                            );
                                        }

                                        if (
                                            isSunday(v) &&
                                            differenceInCalendarDays(new Date(doc.endDate), endOfWeek(new Date(v))) >= 0
                                        ) {
                                            const width = differenceInCalendarDays(endOfWeek(new Date(v)), v) + 1;
                                            return (
                                                <AnnualBox doc={doc} width={width} key={`${doc.documentUid}+${v}`} />
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
    );
};

export default Calendar;

const AnnualBox = ({ width, doc }: { width: number; doc: any }) => {
    return (
        <Box
            width={`${100 * width}%`}
            bg={`#${doc.color}`}
            color="#fff"
            fontWeight="bold"
            ml={`${width - 1}px`}
            mt="1px"
            cursor="pointer"
            position="relative"
            fontSize="0.8rem"
            p="1px"
            textShadow="0px 0px 2px #000"
        >
            <Tooltip hasArrow label={doc.type === "full" ? "연차" : "반차"} bg="blue.600">
                {doc.name}
            </Tooltip>
        </Box>
    );
};
