
// recorder.h

#pragma once

#include <windows.h> /* HHOOK       */   
#include <vector>    /* std::vector */

#include "json.hpp"  /* nhlomann    */
#include "keyEvent.h"

using json = nlohmann::json;


/*******************************************************
 * CLASS - Recorder.h
 * -----------------------------------------------------
 * This class
********************************************************/

class Recorder
{
public:
    static Recorder& instance();

    void start();
    void stop();
    json getEventsAsJson() const;

private:
    Recorder() = default;
    ~Recorder() = default;
    Recorder(const Recorder&) = delete;
    Recorder& operator=(const Recorder&) = delete;

    static LRESULT CALLBACK KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam);

    HHOOK hook = NULL;
    std::vector<KeyEvent> recordedKeyEvents;
};